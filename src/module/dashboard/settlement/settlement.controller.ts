import {
    BadRequestException,
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Logger,
    Param,
    Post,
    Put,
    Query,
    UseGuards
} from "@nestjs/common";
import {PartnerPayment} from "../../../entity/partner-payment.entity";
import {Const} from "../../../common/util/const";
import {Transaction} from "../../../entity/transaction.entity";
import {EntityManager, getConnection} from "typeorm";
import {NgoPayout} from "../../../entity/ngo-payout.entity";
import {Ngo} from "../../../entity/ngo.entity";
import {UserPeriod} from "../../../entity/user-period.entity";
import {PartnerPeriod} from "../../../entity/partner-period.entity";
import {Configuration} from "../../../entity/configuration.entity";
import {NgoPeriod} from "../../../entity/ngo-period.entity";
import {TadeusEntity} from "../../../entity/base.entity";
import {Donation} from "../../../entity/donation.entity";
import {roundToTwo} from "../../../common/util/functions";
import {ApiBearerAuth, ApiHeader} from "@nestjs/swagger";
import {Roles} from "../../../common/decorators/roles.decorator";
import {RoleEnum} from "../../../common/enum/role.enum";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";

const moment = require('moment');

@Controller()
export class SettlementController {

    private readonly logger = new Logger(SettlementController.name);

    @Post('partner')
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
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
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
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
                            payment.isPaid = transactions.length === transactions.filter(e => e.isPaid).length;
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
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async getPartnerPeriods() {
        const periods = await PartnerPeriod.find();

        if (periods.length > 0) {
            return periods.map(p => {
                return {id: p.id, from: p.from}
            })
        }

        return []
    }

    @Get('ngo/periods')
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async getNgoPeriods() {
        const periods = await NgoPeriod.find();

        if (periods.length > 0) {
            return periods.map(p => {
                return {id: p.id, from: p.from}
            })
        }

        return [];
    }

    @Get('partner')
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async getPayments(@Query() query: { showAll: string, selectedPeriod: string }) {
        let config = await Configuration.getMain();
        let userPeriod = await UserPeriod.findActivePeriod();
        let partnerPeriodQuery = PartnerPeriod.createQueryBuilder('p')
            .leftJoinAndSelect("p.payments", 'payment')
            .leftJoinAndSelect("p.ngoPeriod", 'ngoPeriod')
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
            generatePayout: partnerPeriod ? !partnerPeriod.ngoPeriod : true,
            userCloseInterval: config ? config.userCloseInterval : 0,
            partnerEmailInterval: config ? config.partnerEmailInterval : 0,
            partnerCloseInterval: config ? config.partnerCloseInterval : 0,
            ngoGenerateInterval: config ? config.ngoGenerateInterval : 0,
        }
    }

    @Post('partner/:id/ngoPayout')
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async closePartnerPeriod(@Param('id') id: string) {
        getConnection().transaction(async (entityManager: EntityManager) => {

            let period = await PartnerPeriod.createQueryBuilder("p")
                .where("p.isEditable = false")
                .andWhere("p.sendMessagesAt is not null")
                .andWhere("p.notEditableAt is not null")
                .andWhere("p.isClosed = true")
                .andWhere("p.closedAt is not null")
                .andWhere("p.ngoPeriod is null")
                .andWhere('p.id = :id', {id: id})
                .getOne();

            if (!period) {
                throw new BadRequestException('partner_period_not_allowed')
            }

            let ngoPeriod = await NgoPeriod.createQueryBuilder('p')
                .leftJoinAndSelect("p.payouts", "payout")
                .leftJoinAndSelect("payout.transactions", 'transaction')
                .andWhere("p.isClosed = false")
                .getOne();

            let ngoList: Ngo[] = await Ngo.createQueryBuilder('n')
                .leftJoinAndSelect("n.transactions", "transaction")
                .leftJoinAndSelect("n.donations", "donation")
                .leftJoinAndSelect("transaction.userPeriod", 'transactionUserPeriod')
                .leftJoinAndSelect("donation.userPeriod", 'donationUserPeriod')
                .leftJoin('transactionUserPeriod.partnerPeriod', 'transactionPartnerPeriod')
                .leftJoin('donationUserPeriod.partnerPeriod', 'donationPartnerPeriod')
                .where("transactionPartnerPeriod.id = :id", {id: id})
                .orWhere("donationPartnerPeriod.id = :id", {id: id})
                .getMany();

            let payouts: NgoPayout[] = [];

            if (ngoPeriod && ngoPeriod.payouts) {
                payouts = ngoPeriod.payouts.filter(p => !p.canDisplay);
            }


            if (!ngoPeriod) {
                ngoPeriod = new NgoPeriod(moment(), moment());
                ngoPeriod = await entityManager.save(ngoPeriod);
            }

            period.ngoPeriod = ngoPeriod;
            await entityManager.save(period);

            for (const ngo of ngoList) {
                const transactions = ngo.transactions;
                const donations = ngo.donations;

                let initialPrice = 0;

                if (transactions) {
                    initialPrice = transactions.reduce((prev: number, value: Transaction) => prev + (value.ngoDonation), initialPrice);
                }
                if (donations) {
                    initialPrice = donations.reduce((prev: number, value: Donation) => prev + (value.price), initialPrice);
                }

                let payout = new NgoPayout(
                    roundToTwo(initialPrice),
                    ngo,
                    ngoPeriod);
                payout.transactions = ngo.transactions;
                payout.donations = ngo.donations;
                payouts.push(payout);
            }

            let userPeriods = await UserPeriod.createQueryBuilder('u')
                .leftJoinAndSelect("u.partnerPeriod", 'p')
                .where("u.ngoPeriod is null")
                .andWhere("u.isClosed = true")
                .andWhere("p.id = :id", {id: id})
                .getMany();


            for (let payout of payouts) {
                let transactions = payout.transactions;
                let donations = payout.donations;

                if (transactions) {
                    const paidTransactions = transactions.filter(t => t.isPaid);
                    payout.canDisplay = paidTransactions.length === transactions.length;
                } else {
                    payout.canDisplay = true;
                }

                let savedPayout = await entityManager.save(payout);
                if (!payout.id) {
                    if (transactions) {
                        transactions.forEach(t => {
                            t.payout = savedPayout;
                        });
                        await entityManager.save(transactions);
                    }
                    if (donations) {
                        donations.forEach(d => {
                            d.payout = savedPayout;
                        });
                        await entityManager.save(donations);
                    }
                }
            }
            for (const userPeriod of userPeriods) {
                userPeriod.ngoPeriod = ngoPeriod;
            }
            await entityManager.save(userPeriods);
        })
    }

    @Put('partner/notifications')
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
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
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async getNgoPayouts(@Query() query: { selectedPeriod: string, showAll: string }) {
        let config = await Configuration.getMain();
        if (!config) {
            throw new InternalServerErrorException('internal_server_error')
        }

        let ngoPeriodQuery = NgoPeriod.createQueryBuilder('n')
            .leftJoinAndSelect("n.payouts", 'payout')
            .leftJoinAndSelect("payout.ngo", 'ngoPeriod');

        if (query) {
            if (query.selectedPeriod && query.selectedPeriod !== 'null') {
                ngoPeriodQuery = ngoPeriodQuery.where("n.id = :id", {id: query.selectedPeriod});
            } else {
                ngoPeriodQuery = ngoPeriodQuery.where("n.isClosed = false")
            }
            if (query.showAll === 'false') {
                ngoPeriodQuery = ngoPeriodQuery
                    .andWhere("payout.isPaid = false");
            }
        } else {
            ngoPeriodQuery = ngoPeriodQuery.where("n.isClosed = false");
        }
        const ngoPeriod = await ngoPeriodQuery.getOne();

        let ngoPayouts: NgoPayout[] = [];

        if (ngoPeriod && ngoPeriod.payouts) {
            ngoPayouts = ngoPeriod.payouts;
        }

        if (ngoPeriod && !ngoPeriod.isClosed) {
            let payouts: NgoPayout[] = await NgoPayout.createQueryBuilder('n')
                .leftJoin('n.ngoPeriod', 'period')
                .leftJoinAndSelect('n.ngo', 'ngo')
                .where('period.id != :id', {id: ngoPeriod.id})
                .andWhere('n.isPaid = false')
                .getMany();

            if (payouts) {
                ngoPayouts = ngoPayouts.concat(payouts).sort((t1, t2) => {
                    return this.sortTransactionsByCreationDate(t1, t2);
                })
            }
        }

        return {
            payouts: ngoPayouts.filter(e => e.canDisplay).map(e => new NgoPayment(e)),
            currentPeriod: ngoPeriod ? ngoPeriod.id : null,
            from: ngoPeriod ? ngoPeriod.from : null,
            isClosed: ngoPeriod ? ngoPeriod.isClosed : false,
            closeInterval: config.ngoCloseInterval
        }
    }

    @Put('ngo')
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async updateNgoPayouts(@Body() dto: NgoPayment[]) {
        const changedData = dto.filter(e => e.hasChanges);

        if (changedData.length === 0) {
            return;
        }

        const changedPaymentIds = changedData.map(e => e.id);
        let payouts: NgoPayout[] = await NgoPayout.createQueryBuilder('n')
            .where('n.id IN (:...list)', {list: changedPaymentIds})
            .getMany();

        getConnection().transaction(async (entityManager: EntityManager) => {
            for (const payout of payouts) {
                let dto = changedData.find(e => e.id === payout.id);
                if (dto) {
                    payout.paymentDetails = dto.paymentDetails;
                    payout.isPaid = dto.isPaid;
                    await entityManager.save(payout);
                }
            }
        });
    }

    @Put('ngo/:id/close')
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async closeNgoPeriod(@Param('id') id: string) {
        const period = await NgoPeriod.createQueryBuilder("p")
            .where('p.id = :id', {id: id})
            .andWhere('p.isClosed = false')
            .getOne();

        if (period) {
            period.isClosed = true;
            await period.save();
        }
    }
}

class NgoPayment {
    id: string;
    isPaid: boolean;
    paymentDetails?: string;
    hasChanges: boolean;
    ngoId: string;
    ngoName: string;
    createdAt: Date;
    price: number;

    constructor(payout: NgoPayout) {
        this.id = payout.id;
        this.isPaid = payout.isPaid;
        this.paymentDetails = payout.paymentDetails;
        this.hasChanges = false;
        this.ngoId = payout.ngo.id;
        this.ngoName = payout.ngo.name;
        this.price = payout.price;
        this.createdAt = payout.createdAt;
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
