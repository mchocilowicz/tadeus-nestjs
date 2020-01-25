import {BadRequestException, Body, Controller, Get, Post, Put} from "@nestjs/common";
import {MyEventEmitter} from "../../../events/index.event";
import {InjectEventEmitter} from "nest-emitter";
import {Period} from "../../../database/entity/period.entity";
import {PartnerPayment} from "../../../database/entity/partner-payment.entity";
import {Const} from "../../../common/util/const";
import {Transaction} from "../../../database/entity/transaction.entity";
import {EntityManager, getConnection} from "typeorm";

const moment = require('moment');

@Controller()
export class SettlementController {

    constructor(@InjectEventEmitter() private readonly emitter: MyEventEmitter) {
    }

    @Post('partner')
    async generatePartnerPayments() {
        let userPeriods: Period[] = await Period.createQueryBuilder('p')
            .leftJoinAndSelect('p.transactions', 'transaction')
            .leftJoinAndSelect('transaction.tradingPoint', 'point')
            .where('p.isClosed = true')
            .andWhere("p.type = 'CLIENT'")
            .andWhere("transaction.status = 'ACCEPTED'")
            .andWhere('p.period is null')
            .getMany();

        if (userPeriods.length > 0) {
            this.emitter.emit('periods', userPeriods);
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

    @Put('partner/close')
    async closePayments() {
        let userPeriods: Period[] = await Period.createQueryBuilder('p')
            .leftJoinAndSelect('p.transactions', 'transaction')
            .leftJoinAndSelect('transaction.tradingPoint', 'point')
            .where('p.isClosed = true')
            .andWhere("p.type = 'CLIENT'")
            .andWhere("transaction.status = 'ACCEPTED'")
            .andWhere('p.period is null')
            .getMany();
        if (userPeriods.length > 0) {
            throw new BadRequestException('user_period_not_touched')
        } else {
            let activePartnerPeriod: Period | undefined = await Period.findOne({isClosed: false, type: 'PARTNER'});
            if (activePartnerPeriod) {
                activePartnerPeriod.isClosed = true;
                await activePartnerPeriod.save();
            }
        }
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
        this.from = moment(payment.period.from).format(Const.DATE_FORMAT);
        this.to = moment(payment.period.to).format(Const.DATE_FORMAT);
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
