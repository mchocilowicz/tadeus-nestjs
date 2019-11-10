import {Column, Entity, JoinColumn, ManyToOne, OneToMany} from "typeorm";
import {TradingPoint} from "./trading-point.entity";
import {TadeusEntity} from "./base.entity";
import {Transaction} from "./transaction.entity";
import {Period} from "./period.entity";
import {ColumnNumericTransformer} from "../../common/util/number-column.transformer";

@Entity({schema: 'tds'})
export class PartnerPayment extends TadeusEntity {
    @Column()
    ID: string;

    @Column({nullable: true})
    paymentNumber?: string;

    @Column({default: false})
    isPaid: boolean = false;

    @Column({nullable: true, type: 'decimal', transformer: new ColumnNumericTransformer()})
    price: number = 0;

    @Column({nullable: true})
    partnerPaymentAt?: Date;

    @ManyToOne(type => TradingPoint)
    @JoinColumn()
    tradingPoint: TradingPoint;

    @OneToMany(type => Transaction, transactions => transactions.payment)
    transactions?: Transaction[];

    @ManyToOne(type => Period)
    @JoinColumn()
    period: Period;

    constructor(ID: string, tradingPoint: TradingPoint, period: Period) {
        super();
        this.ID = ID;
        this.tradingPoint = tradingPoint;
        this.period = period;
    }
}
