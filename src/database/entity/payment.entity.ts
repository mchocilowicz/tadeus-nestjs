import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cart } from "./cart.entity";
import { TradingPoint } from "./trading-point.entity";

@Entity({schema: 'tds'})
export class Payment extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    ID: string;

    @Column()
    invoiceNumber: string;

    @ManyToOne(type => Cart, cart => cart.payments)
    @JoinColumn()
    cart: Cart;

    @ManyToOne(type => TradingPoint)
    @JoinColumn()
    tradingPoint: TradingPoint;

    @CreateDateColumn()
    createdAt: Date;
}
