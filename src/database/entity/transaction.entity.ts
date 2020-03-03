import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { TradingPoint } from "./trading-point.entity";
import { User } from "./user.entity";

import { Terminal } from "./terminal.entity";
import { TadeusEntity } from "./base.entity";
import { PartnerPayment } from "./partner-payment.entity";
import { ColumnNumericTransformer } from "../../common/util/number-column.transformer";
import { TransactionStatus } from "../../common/enum/status.enum";
import { Ngo } from "./ngo.entity";
import { NgoPayout } from "./ngo-payout.entity";
import { PartnerPeriod } from "./partner-period.entity";
import { UserPeriod } from "./user-period.entity";
import { NgoPeriod } from "./ngo-period.entity";
import { roundToTwo } from "../../common/util/functions";

const moment = require('moment');

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'TRANSACTION'})
export class Transaction extends TadeusEntity {
    @Column({name: 'ID'})
    ID: string;

    @Column({name: 'PRICE', type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    price: number;

    @Column({name: 'DONATION_PERCENTAGE', type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    donationPercentage: number = 0;

    @Column({name: 'PROVISION_PERCENTAGE', type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    provisionPercentage: number = 0;

    @Column({name: 'PAYMENT_VALUE', type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    paymentValue: number = 0;

    @Column({name: 'VAT', type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    vat: number = 0;

    @Column({name: 'PROVISION', type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    provision: number = 0;

    @Column({name: 'TOTAL_POOL', type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    poolValue: number = 0;

    @Column({name: 'DONATION_POOL', type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    donationPool: number = 0;

    @Column({name: 'PERSONAL_POOL', type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    personalPool: number = 0;

    @Column({name: 'USER_XP', default: 0, transformer: new ColumnNumericTransformer()})
    userXp: number = 0;

    @Column({name: 'PARTNER_XP', default: 0, transformer: new ColumnNumericTransformer()})
    tradingPointXp: number = 0;

    @Column({name: 'NGO_DONATION', type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    ngoDonation: number = 0;

    @Column({name: 'STATUS', type: 'text', default: TransactionStatus.WAITING})
    status: TransactionStatus = TransactionStatus.WAITING;

    @Column({name: 'IS_CORRECTION'})
    isCorrection: boolean = false;

    @Column({name: 'IS_PAID'})
    isPaid: boolean = false;

    @ManyToOne(type => TradingPoint, tradingPoint => tradingPoint.transactions)
    @JoinColumn({name: 'PARTNER_SKID'})
    tradingPoint: TradingPoint;

    @ManyToOne(type => User, user => user.transactions)
    @JoinColumn({name: 'USER_SKID'})
    user: User;

    @ManyToOne(type => Terminal, terminal => terminal.transactions)
    @JoinColumn({name: 'TERMINAL_SKID'})
    terminal: Terminal;

    @ManyToOne(type => PartnerPayment, payment => payment.transactions)
    @JoinColumn({name: 'PARTNER_PAYMENT_SKID'})
    payment?: PartnerPayment;

    @ManyToOne(type => NgoPayout, payout => payout.transactions)
    @JoinColumn({name: 'NGO_PAYOUTT_SKID'})
    payout?: NgoPayout;

    @ManyToOne(type => PartnerPeriod, period => period.transactions)
    @JoinColumn({name: 'PARTNER_PERIOD_SKID'})
    partnerPeriod?: PartnerPeriod;

    @ManyToOne(type => NgoPeriod, period => period.transactions)
    @JoinColumn({name: 'NGO_PERIOD_SKID'})
    ngoPeriod?: NgoPeriod;

    @ManyToOne(type => UserPeriod, period => period.transactions)
    @JoinColumn({name: 'USER_PERIOD_SKID'})
    userPeriod: UserPeriod;

    @ManyToOne(type => Ngo, ngo => ngo.transactions)
    @JoinColumn({name: 'NGO_SKID'})
    ngo: Ngo;

    @OneToOne(type => Transaction)
    @JoinColumn({name: 'CORRECTION_SKID'})
    correction?: Transaction;

    readonly class: string = 'TRANSACTION';

    constructor(terminal: Terminal,
                user: User,
                tradingPoint: TradingPoint,
                ngo: Ngo,
                period: UserPeriod,
                ID: string,
                price: number,
                vat: number,
                fee: number,
                donationPercentage: number) {
        super();
        this.terminal = terminal;
        this.user = user;
        this.tradingPoint = tradingPoint;
        this.ngo = ngo;
        this.ID = ID;
        this.price = price;
        this.donationPercentage = donationPercentage;
        this.provisionPercentage = fee;
        this.vat = vat;
        this.userPeriod = period;
    }

    static findByTradingPointMadeToday(tradingPointId: string) {
        return this.createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.tradingPoint', 'tradingPoint')
            .where(`to_date(cast(transaction.createdAt as TEXT),'YYYY-MM-DD') = to_date('${ moment().format('YYYY-MM-DD') }','YYYY-MM-DD')`)
            .andWhere('transaction.isCorrection = false')
            .andWhere('tradingPoint.id = :id', {id: tradingPointId})
            .getMany();
    }

    static findByUserMadeToday(userId: string) {
        return this.createQueryBuilder('transaction')
            .leftJoinAndSelect("transaction.user", 'user')
            .leftJoinAndSelect('transaction.tradingPoint', 'tradingPoint')
            .where(`to_date(cast(transaction.createdAt as TEXT),'YYYY-MM-DD') = to_date('${ moment().format('YYYY-MM-DD') }','YYYY-MM-DD')`)
            .andWhere('transaction.isCorrection = false')
            .andWhere('user.id = :user', {user: userId})
            .getMany();
    }

    updateXpValues(userXp: number, tradingPointXp: number) {
        this.userXp = Number(userXp);
        this.tradingPointXp = Number(tradingPointXp);
    }

    updatePaymentValues(provision: number, pool: number) {
        this.paymentValue = roundToTwo(Number(provision + pool));
        this.poolValue = Number(pool);
        this.provision = Number(provision);
    }

    setUserPool(halfPool: number) {
        this.personalPool = halfPool;
        this.donationPool = halfPool;
    }
}
