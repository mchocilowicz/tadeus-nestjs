import {
    BadRequestException,
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Logger,
    Post,
    Put,
    Query
} from "@nestjs/common";
import {PartnerPayment} from "../../../database/entity/partner-payment.entity";
import {Const} from "../../../common/util/const";
import {Transaction} from "../../../database/entity/transaction.entity";
import {EntityManager, getConnection, SelectQueryBuilder} from "typeorm";
import {NgoPayout} from "../../../database/entity/ngo-payout.entity";
import {Ngo} from "../../../database/entity/ngo.entity";
import {UserPeriod} from "../../../database/entity/user-period.entity";
import {PartnerPeriod} from "../../../database/entity/partner-period.entity";
import {Configuration} from "../../../database/entity/configuration.entity";
import {NgoPeriod} from "../../../database/entity/ngo-period.entity";

const moment = require('moment');

@Controller()
export class SettlementController {

    private readonly logger = new Logger(SettlementController.name);

    @Post('partner')
    async generatePartnerPayments() {
        let userPeriods: UserPeriod[] = await UserPeriod.createQueryBuilder('p')
            .leftJoinAndSelect('p.transactions', 'transaction')
            .leftJoinAndSelect('transaction.tradingPoint', 'point')
            .where('p.isClosed = true')
            .andWhere("transaction.status = 'ACCEPTED'")
            .andWhere('p.partnerPeriod is null')
            .getMany();

        if (userPeriods.length > 0) {
            this.logger.log('Partners Payments Generation - start');

            await getConnection().transaction(async (entityManager: EntityManager) => {
                let activePartnerPeriod: PartnerPeriod | undefined = await PartnerPeriod.findActivePeriod();
                const config: Configuration | undefined = await Configuration.getMain();

                if (!config) {
                    throw new InternalServerErrorException()
                }
                if (!activePartnerPeriod) {
                    let interval = config.partnerEmailInterval + config.partnerCloseInterval + config.ngoGenerateInterval;
                    activePartnerPeriod = new PartnerPeriod(moment(), moment().add(interval, 'days'));
                    activePartnerPeriod = await entityManager.save(activePartnerPeriod)
                }
                for (const period of userPeriods) {
                    const transactions = period.transactions?.sort((t1: Transaction, t2: Transaction) => t1.tradingPoint.id === t2.tradingPoint.id ? 0 : -1);

                    const payments: PartnerPayment[] = [];
                    transactions?.forEach((t: Transaction) => {
                        let payment: PartnerPayment | undefined = payments.find((payment: PartnerPayment) => payment.tradingPoint.id === t.tradingPoint.id);
                        if (payment) {
                            payment.transactionsCount += 1;
                            payment.provisionPrice += t.provision;
                            payment.donationPrice += t.poolValue;
                            payment.price += t.price;
                            payment.sellPrice += t.paymentValue;
                        } else {
                            if (activePartnerPeriod) {
                                const ID = t.tradingPoint.ID + "-" + moment().format('YYYYMMDD');
                                payment = new PartnerPayment(ID, t.paymentValue, t.price, t.poolValue, t.provision, 1, t.tradingPoint, activePartnerPeriod);
                                payment.from = period.from;
                                payment.to = period.to;
                                payments.push(payment);
                            }
                        }
                    });

                    await entityManager.save(payments);
                    period.partnerPeriod = activePartnerPeriod;
                    await entityManager.save(period);
                }
            });
            this.logger.log('Partners Payments Generation - end');

        } else {
            throw new BadRequestException('no_active_user_period')
        }
    }

    @Put('partner')
    async updatePayments(@Body() dto: PartnerPaymentResponse[]) {
        for (const payment of dto) {
            let p: PartnerPayment | undefined = await PartnerPayment.createQueryBuilder('p')
                .leftJoinAndSelect('p.transactions', 'transaction')
                .where('p.ID = :id', {id: payment.ID})
                .andWhere('transaction.isPaid = false')
                .getOne();

            getConnection().transaction(async (entityManager: EntityManager) => {
                if (p && !p.isPaid) {
                    const transactions: Transaction[] | undefined = p.transactions;
                    if (payment.paidPrice > payment.price) {
                        transactions?.forEach(t => t.isPaid = true);
                        p.isPaid = true;
                        p.partnerPayedAt = new Date();
                        await entityManager.save(p);
                        await entityManager.save(transactions);
                    } else if (payment.paidPrice > p.paidPrice) {
                        let totalPrice = payment.paidPrice;
                        transactions?.forEach(t => {
                            if (totalPrice > 0 && totalPrice >= t.poolValue) {
                                totalPrice -= t.poolValue;
                                t.isPaid = true;
                            }
                        });
                        await entityManager.save(transactions);
                    }
                }
            });
        }
    }

    @Get('partner')
    async getPayments() {
        let payments: PartnerPayment[] = await PartnerPayment.createQueryBuilder('p')
            .leftJoinAndSelect('p.tradingPoint', 'point')
            .leftJoinAndSelect('p.period', 'period')
            .where("p.isPaid = false")
            .getMany();

        return payments.map((p: PartnerPayment) => new PartnerPaymentResponse(p))
    }

    @Put('partner/notifications')
    async closePayments() {
        let userPeriods: UserPeriod[] = await UserPeriod.createQueryBuilder('p')
            .leftJoinAndSelect('p.transactions', 'transaction')
            .leftJoinAndSelect('transaction.tradingPoint', 'point')
            .where('p.isClosed = true')
            .andWhere("transaction.status = 'ACCEPTED'")
            .andWhere('p.partnerPeriod is null')
            .getMany();

        if (userPeriods.length > 0) {
            throw new BadRequestException('user_period_not_touched')
        } else {
            getConnection().transaction(async entityManager => {
                let activePartnerPeriod: PartnerPeriod | undefined = await PartnerPeriod.findActivePeriod();
                if (activePartnerPeriod) {
                    const payments = activePartnerPeriod.payments;
                    if (payments) {
                        payments.forEach(payment => {
                            payment.sendMessageAt = moment().add(1, 'days');
                        });
                        await entityManager.save(payments);
                    }
                    activePartnerPeriod.sendMessagesAt = moment().add(1, 'days');
                    await entityManager.save(activePartnerPeriod);
                }
            });
        }
    }

    @Get('ngo')
    async getNgoPayouts(@Query() query: any) {
        let payoutQuery: SelectQueryBuilder<NgoPayout> = NgoPayout.createQueryBuilder("n")
            .leftJoinAndSelect("n.ngo", "ngo")
            .leftJoinAndSelect("n.period", "period")
            .where("n.canDisplay = true");

        if (!query && !query.showAll) {
            payoutQuery.andWhere("n.isPaid = true")
        }

        return payoutQuery
            .getMany();

    }

    @Put('ngo')
    async updateNgoPayouts() {

    }

    @Post('ngo')
    async generateNgoPayouts() {
        let period = await PartnerPeriod.createQueryBuilder("p")
            .where("p.isEditable = false")
            .andWhere("p.sendMessagesAt is not null")
            .andWhere("p.notEditableAt is not null")
            .andWhere("p.isClosed = false")
            .andWhere("p.closedAt is null")
            .andWhere("p.ngoPeriod is null")
            .getOne();

        let ngoPeriod = await NgoPeriod.createQueryBuilder('n')
            .leftJoinAndSelect("n.payouts", "payout")
            .leftJoinAndSelect("payout.transactions", 'transaction')
            .andWhere("p.isClosed = false")
            .andWhere("payout.isPaid = false")
            .getOne();

        let ngos: Ngo[] = await Ngo.createQueryBuilder('n')
            .leftJoinAndSelect("n.transactions", "t")
            .leftJoin("t.payment", 'payment')
            .leftJoin("payment.period", 'period')
            .where("period.id = :id", {id: period?.id})
            .getMany();

        let payouts: NgoPayout[] = [];

        if (ngoPeriod && ngoPeriod.payouts) {
            payouts = ngoPeriod.payouts;
        }

        for (const ngo of ngos) {
            if (ngoPeriod && ngo.transactions) {
                let payout = new NgoPayout(
                    ngo.transactions?.reduce((prev: number, value: Transaction) => prev + (value.ngoDonation), 0),
                    ngo,
                    ngoPeriod);
                payout.transactions = ngo.transactions;
                payouts.push(payout);
            }
        }

        let userPeriods = await UserPeriod.createQueryBuilder('u')
            .leftJoinAndSelect("u.partnerPeriod", 'p')
            .where("u.ngoPeriod is null")
            .andWhere("p.id = :id", {id: period?.id})
            .getMany();

        getConnection().transaction(async (entityManager: EntityManager) => {
            for (let payout of payouts) {
                let transactions = payout.transactions;
                if (transactions) {
                    let paidT = transactions.filter(value => value.isPaid);

                    if (!payout.id) {
                        if (paidT.length === transactions.length) {
                            payout.canDisplay = true;
                        }
                        payout = await entityManager.save(payout);
                        transactions.forEach(t => {
                            t.payout = payout;
                        });
                        await entityManager.save(transactions);
                    } else {
                        if (paidT.length === transactions.length) {
                            payout.canDisplay = true;
                        }
                        await entityManager.save(payout);
                    }
                }
            }
            for (const userPeriod of userPeriods) {
                userPeriod.ngoPeriod = ngoPeriod;
                await entityManager.save(userPeriod);
            }
        })
    }
}

class PartnerPaymentResponse {
    ID: string;
    from: string;
    to: string;
    price: number;
    paidPrice: number;
    sellPrice: number;
    transactions: number;
    donationPrice: number;
    provisionPrice: number;
    details: string;
    tradingPoint: string;
    paymentAt?: Date;

    constructor(payment: PartnerPayment) {
        this.ID = payment.ID;
        this.from = moment(payment.from).format(Const.DATE_FORMAT);
        this.to = moment(payment.to).format(Const.DATE_FORMAT);
        this.price = payment.price;
        this.sellPrice = payment.sellPrice;
        this.transactions = payment.transactionsCount;
        this.donationPrice = payment.donationPrice;
        this.provisionPrice = payment.provisionPrice;
        this.details = payment.paymentDetails ? payment.paymentDetails : '';
        this.tradingPoint = payment.tradingPoint.ID;
        this.paidPrice = payment.paidPrice;
        this.paymentAt = payment.paymentAt;
    }
}
