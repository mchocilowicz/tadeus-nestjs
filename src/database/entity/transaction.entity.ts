import {Column, Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";
import {TradingPoint} from "./trading-point.entity";
import {User} from "./user.entity";

import {Terminal} from "./terminal.entity";
import {TadeusEntity} from "./base.entity";
import {PartnerPayment} from "./partner-payment.entity";
import {ColumnNumericTransformer} from "../../common/util/number-column.transformer";
import {Donation} from "./donation.entity";
import {TransactionStatus} from "../../common/enum/status.enum";

const moment = require('moment');

@Entity({schema: 'tds'})
export class Transaction extends TadeusEntity {
    @Column()
    ID: string;

    @Column({type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    price: number;

    @Column({type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    donationPercentage: number = 0;

    @Column({type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    provisionPercentage: number = 0;

    @Column({type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    paymentValue: number = 0;

    @Column({type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    vat: number = 0;

    @Column({type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    provision: number = 0;

    @Column({type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    poolValue: number = 0;

    @Column({type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    donationPool: number = 0;

    @Column({type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    personalPool: number = 0;

    @Column({transformer: new ColumnNumericTransformer()})
    userXp: number = 0;

    @Column({transformer: new ColumnNumericTransformer()})
    tradingPointXp: number = 0;

    @Column({type: 'text', default: TransactionStatus.WAITING})
    status: TransactionStatus = TransactionStatus.WAITING;

    @Column()
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
        this.paymentValue = Number(provision + pool);
        this.poolValue = Number(pool);
        this.provision = Number(provision);
    }

    setUserPool(personal: number, donation: number) {
        this.personalPool = personal;
        this.donationPool = donation;
    }
}
