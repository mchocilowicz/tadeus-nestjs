import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { TradingPoint } from "./trading-point.entity";
import { TadeusEntity } from "./base.entity";
import { Transaction } from "./transaction.entity";
import { Period } from "./period.entity";
import { ColumnNumericTransformer } from "../../common/util/number-column.transformer";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'PARTNER_PAYMENT'})
export class PartnerPayment extends TadeusEntity {
    @Column({name: 'ID'})
    ID: string;

    @Column({name: 'PAYMENT_NUMBER', nullable: true})
    paymentNumber?: string;

    @Column({name: 'IS_PAID', default: false})
    isPaid: boolean = false;

    @Column({name: 'PRICE', nullable: true, type: 'decimal', transformer: new ColumnNumericTransformer()})
    price: number = 0;

    @Column({name: 'PAYED_AT', nullable: true})
    partnerPaymentAt?: Date;

    @ManyToOne(type => TradingPoint)
    @JoinColumn({name: 'PARTNER_SKID'})
    tradingPoint: TradingPoint;

    @OneToMany(type => Transaction, transactions => transactions.payment)
    transactions?: Transaction[];

    @ManyToOne(type => Period)
    @JoinColumn({name: 'PERIOD_SKID'})
    period: Period;

    constructor(ID: string, tradingPoint: TradingPoint, period: Period) {
        super();
        this.ID = ID;
        this.tradingPoint = tradingPoint;
        this.period = period;
    }
}
