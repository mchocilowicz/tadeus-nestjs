import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { TadeusEntity } from "./base.entity";
import { Ngo } from "./ngo.entity";
import { Period } from "./period.entity";
import { ColumnNumericTransformer } from "../../common/util/number-column.transformer";
import { Transaction } from "./transaction.entity";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'NGO_PAYOUT'})
export class NgoPayout extends TadeusEntity {

    @Column({name: 'PRICE', type: 'decimal', transformer: new ColumnNumericTransformer()})
    price: number;

    @Column({name: 'IS_PAID', default: false})
    isPaid: boolean = false;

    @Column({name: 'CAN_DISPLAY', default: false})
    canDisplay: boolean = false;

    @ManyToOne(type => Period)
    @JoinColumn({name: 'NGO_SKID'})
    ngo: Ngo;

    @ManyToOne(type => Period)
    @JoinColumn({name: 'PERIOD_SKID'})
    period: Period;

    @OneToMany(type => Transaction, transactions => transactions.payout)
    transactions: Transaction[] = [];

    constructor(price: number, ngo: Ngo, period: Period) {
        super();
        this.price = price;
        this.ngo = ngo;
        this.period = period;
    }

}
