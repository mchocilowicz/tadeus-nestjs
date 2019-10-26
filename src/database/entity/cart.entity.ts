import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { TradingPoint } from "./trading-point.entity";
import { Transaction } from "./transaction.entity";
import { Payment } from "./payment.entity";
import { TadeusEntity } from "./base.entity";


@Entity({schema: 'tds'})
export class Cart extends TadeusEntity {

    @Column({default: false})
    isPaid: boolean = false;

    @Column({nullable: true, type: 'decimal'})
    price?: number;

    @Column({nullable: true})
    paymentDate?: Date;

    @ManyToOne(type => TradingPoint)
    @JoinColumn()
    tradingPoint?: TradingPoint;

    @OneToMany(type => Transaction, transaction => transaction.cart)
    transactions?: Transaction[];

    @OneToMany(type => Payment, payment => payment.cart)
    payments?: Payment[];
}
