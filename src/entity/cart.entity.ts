import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Transaction } from "./transaction.entity";
import { TradingPoint } from "./trading-point.entity";


@Entity()
export class Cart extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => TradingPoint)
    @JoinColumn()
    tradingPoint: TradingPoint;

    @OneToMany(type => Transaction, transaction => transaction.cart)
    transactions: Transaction[];

    @Column()
    date: string;

    isPaid: boolean = false
}
