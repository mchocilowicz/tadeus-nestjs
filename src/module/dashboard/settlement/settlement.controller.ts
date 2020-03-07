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
import {TadeusEntity} from "../../../database/entity/base.entity";

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
                    if (transactions) {
                        const payments: PartnerPayment[] = [];
                        for (const t of transactions) {
                            let payment: PartnerPayment | undefined = payments.find((payment: PartnerPayment) => payment.tradingPoint.id === t.tradingPoint.id);
                            if (payment) {
                                payment.transactionsCount += 1;
                                payment.provisionPrice += t.provision;
                                payment.donationPrice += t.poolValue;
                                payment.price += t.paymentValue;
                                payment.sellPrice += t.price;
                                t.payment = payment;
                            } else {
                                if (activePartnerPeriod) {
                                    const ID = t.tradingPoint.ID + "-" + moment().format('YYYYMMDD');
                                    payment = new PartnerPayment(ID, t.paymentValue, t.price, t.poolValue, t.provision, 1, t.tradingPoint, activePartnerPeriod);
                                    payment.from = period.from;
                                    payment.to = period.to;
                                    payment = await entityManager.save(payment);
                                    t.payment = payment;
                                    payments.push(payment);
                                }
                            }
                        }
                        await entityManager.save(payments);
                        period.partnerPeriod = activePartnerPeriod;
                        await entityManager.save(period);
                        await entityManager.save(transactions);
                    }
                }

            });
            this.logger.log('Partners Payments Generation - end');
        } else {
            throw new BadRequestException('no_active_user_period')
        }
    }

    @Put('partner')
    async updatePayments(@Body() dto: PartnerPaymentResponse[]) {
        const changedData = dto.filter(e => e.hasChanges);

        if (changedData.length === 0) {
            return [];
        }
        const changedPaymentIds = changedData.map(e => e.ID);
        let payments: PartnerPayment[] = await PartnerPayment.createQueryBuilder('p')
            .leftJoinAndSelect('p.transactions', 'transaction')
            .where('p.ID IN (:...list)', {list: changedPaymentIds})
            .getMany();

        getConnection().transaction(async (entityManager: EntityManager) => {
            for (const payment of payments) {
                let dto = changedData.find(e => e.ID === payment.ID);
                if (dto) {
                    if (!payment.isPaid && dto.paidPrice > 0 && payment.paidPrice !== dto.paidPrice) {
                        let transactions = payment.transactions;
                        let paidTransactions: Transaction[] = [];
                        let paidPrice = dto.paidPrice;
                        if (transactions) {
                            transactions
                                .filter(t => !t.isPaid)
                                .sort((t1, t2) => {
                                    return this.sortTransactionsByCreationDate(t1, t2);
                                })
                                .forEach(t => {
                                    if (paidPrice > 0 && paidPrice >= t.paymentValue) {
                                        paidPrice -= t.paymentValue;
                                        t.isPaid = true;
                                        paidTransactions.push(t);
                                    }
                                });
                            await entityManager.save(paidTransactions);
                            payment.isPaid = transactions.length === transactions.filter(e => e.isPaid).length
                            if (payment.isPaid) {
                                payment.partnerPayedAt = new Date();
                            }
                        }

                    }
                    payment.paymentDetails = dto.details;
                    payment.paidPrice = dto.paidPrice;
                    await entityManager.save(payment);
                }
            }
        });
    }

    @Get('partner/periods')
    async getPartnerPeriods() {
        const periods = await PartnerPeriod.find();

        if (periods.length > 0) {
            return periods.map(p => {
                return {id: p.id, from: p.from}
            })
        }

        return []
    }

    @Get('partner')
    async getPayments(@Query() query: { showAll: string, selectedPeriod: string }) {
        let config = await Configuration.getMain();
        let userPeriod = await UserPeriod.findActivePeriod();
        let partnerPeriodQuery = PartnerPeriod.createQueryBuilder('p')
            .leftJoinAndSelect("p.payments", 'payment')
            .leftJoinAndSelect('payment.tradingPoint', 'point')
            .leftJoinAndSelect('payment.partnerPeriod', 'period');
        if (query) {
            if (query.selectedPeriod && query.selectedPeriod !== 'null') {
                partnerPeriodQuery = partnerPeriodQuery.where("p.id = :id", {id: query.selectedPeriod});
            } else {
                partnerPeriodQuery = partnerPeriodQuery.where("p.isClosed = false")
                    .andWhere("p.ngoPeriod is null");
            }
            if (query.showAll === 'false') {
                partnerPeriodQuery = partnerPeriodQuery
                    .andWhere("payment.isPaid = false");
            }
        } else {
            partnerPeriodQuery = partnerPeriodQuery.where("p.isClosed = false")
                .andWhere("p.ngoPeriod is null");
        }
        const partnerPeriod = await partnerPeriodQuery.getOne();

        let periodPayments: PartnerPayment[] = [];

        if (partnerPeriod && partnerPeriod.payments) {
            periodPayments = partnerPeriod.payments;
        }

        if (partnerPeriod && !partnerPeriod.isClosed) {
            let payments: PartnerPayment[] = await PartnerPayment.createQueryBuilder('p')
                .leftJoin('p.partnerPeriod', 'period')
                .leftJoinAndSelect('p.tradingPoint', 'point')
                .where('period.id != :id', {id: partnerPeriod.id})
                .andWhere('p.isPaid = false')
                .getMany();

            if (payments) {
                periodPayments = periodPayments.concat(payments).sort((t1, t2) => {
                    return this.sortTransactionsByCreationDate(t1, t2);
                })
            }
        }

        let userCount: number = await UserPeriod.createQueryBuilder('p')
            .leftJoinAndSelect('p.transactions', 'transaction')
            .leftJoinAndSelect('transaction.tradingPoint', 'point')
            .where('p.isClosed = true')
            .andWhere("transaction.status = 'ACCEPTED'")
            .andWhere('p.partnerPeriod is null')
            .getCount();

        return {
            userPeriodFrom: userPeriod ? userPeriod.from : null,
            hasPartnerPeriod: partnerPeriod !== undefined,
            hasDataToProcess: userCount > 0,
            payments: periodPayments.map((p: PartnerPayment) => new PartnerPaymentResponse(p)),
            partnerPeriodFrom: partnerPeriod ? partnerPeriod.from : null,
            partnerPeriodId: partnerPeriod ? partnerPeriod.id : null,
            isEditable: partnerPeriod ? partnerPeriod.isEditable : false,
            sendMessagesAt: partnerPeriod ? partnerPeriod.sendMessagesAt : null,
            notEditableAt: partnerPeriod ? partnerPeriod.notEditableAt : null,
            isClosed: partnerPeriod ? partnerPeriod.isClosed : false,
            closedAt: partnerPeriod ? partnerPeriod.closedAt : null,
            userCloseInterval: config ? config.userCloseInterval : 0,
            partnerEmailInterval: config ? config.partnerEmailInterval : 0,
            partnerCloseInterval: config ? config.partnerCloseInterval : 0,
            ngoGenerateInterval: config ? config.ngoGenerateInterval : 0,
        }
    }

    @Put('partner/close')
    async closePartnerPeriod() {
        const period = await PartnerPeriod.findActivePeriod();

        if (period) {
            period.closedAt = new Date();
            period.isClosed = true;

            await period.save()
        }
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
                    const payments = await PartnerPayment.createQueryBuilder('p')
                        .where('p.isPaid = false')
                        .getMany();

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

    private sortTransactionsByCreationDate(t1: TadeusEntity, t2: TadeusEntity): number {
        if (moment(t1.createdAt).isAfter(t2.createdAt)) {
            return 1;
        } else if (moment(t1.createdAt).isBefore(t2.createdAt)) {
            return -1
        } else {
            return 0;
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
    hasChanges: false = false;
    messageSendAt?: Date;

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
        this.messageSendAt = payment.sendMessageAt;

    }
}
