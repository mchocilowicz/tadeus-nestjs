import {Column, Entity, ManyToOne} from "typeorm";
import {TradingPoint} from "./trading-point.entity";
import {User} from "./user.entity";

import {Terminal} from "./terminal.entity";
import {TadeusEntity} from "./base.entity";
import {PartnerPayment} from "./partner-payment.entity";
import {ColumnNumericTransformer} from "../../common/util/number-column.transformer";

const moment = require('moment');

@Entity({schema: 'tds'})
export class Transaction extends TadeusEntity {
    @Column()
    ID: string;

    @Column({type: 'decimal', transformer: new ColumnNumericTransformer()})
    price: number;

    @Column({type: 'decimal', transformer: new ColumnNumericTransformer()})
    donationPercentage: number = 0;

    @Column({type: 'decimal', transformer: new ColumnNumericTransformer()})
    provisionPercentage: number = 0;

    @Column({type: 'decimal', transformer: new ColumnNumericTransformer()})
    paymentValue: number = 0;

    @Column({type: 'decimal', transformer: new ColumnNumericTransformer()})
    vat: number = 0;

    @Column({type: 'decimal', transformer: new ColumnNumericTransformer()})
    provision: number = 0;

    @Column({type: 'decimal', transformer: new ColumnNumericTransformer()})
    poolValue: number = 0;

    @Column({transformer: new ColumnNumericTransformer()})
    userXp: number = 0;

    @Column({transformer: new ColumnNumericTransformer()})
    tradingPointXp: number = 0;

    @Column()
    isCorrection: boolean = false;

    @ManyToOne(type => TradingPoint, tradingPoint => tradingPoint.transactions)
    tradingPoint: TradingPoint;

    @ManyToOne(type => User, user => user.transactions)
    user: User;

    @ManyToOne(type => Terminal, terminal => terminal.transactions)
    terminal: Terminal;

    @ManyToOne(type => PartnerPayment, payment => payment.transactions)
    payment: PartnerPayment;

    @Column({default: 'TRANSACTION'})
    class: string = 'TRANSACTION';

    constructor(terminal: Terminal,
                user: User,
                tradingPoint: TradingPoint,
                ID: string,
                price: number,
                payment: PartnerPayment,
                vat: number,
                fee: number,
                donationPercentage: number) {
        super();
        this.terminal = terminal;
        this.user = user;
        this.tradingPoint = tradingPoint;
        this.ID = ID;
        this.price = Number(price);
        this.payment = payment;
        this.donationPercentage = Number(donationPercentage);
        this.provisionPercentage = Number(fee);
        this.vat = Number(vat);
    }

    static findByTradingPointMadeToday(tradingPointId: string) {
        return this.createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.tradingPoint', 'tradingPoint')
            .where(`to_date(cast(transaction.createdAt as TEXT),'YYYY-MM-DD') = to_date('${moment().format('YYYY-MM-DD')}','YYYY-MM-DD')`)
            .andWhere('transaction.isCorrection = false')
            .andWhere('tradingPoint.id = :id', {id: tradingPointId})
            .getMany();
    }

    static findByUserMadeToday(userId: string) {
        return this.createQueryBuilder('transaction')
            .leftJoinAndSelect("transaction.user", 'user')
            .leftJoinAndSelect('transaction.tradingPoint', 'tradingPoint')
            .where(`to_date(cast(transaction.createdAt as TEXT),'YYYY-MM-DD') = to_date('${moment().format('YYYY-MM-DD')}','YYYY-MM-DD')`)
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
}
