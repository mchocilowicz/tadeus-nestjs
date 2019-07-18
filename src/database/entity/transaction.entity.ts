import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Ngo } from "./ngo.entity";
import { TradingPoint } from "./trading-point.entity";
import { User } from "./user.entity";
import { Cart } from "./cart.entity";

@Entity()
export class Transaction extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    price: number;

    @Column()
    donationPercentage: number;

    @Column()
    donationValue: number;

    @Column()
    recipeCode: string;

    @Column()
    userXp: number;

    @Column()
    tradingPointXp: number;

    @Column()
    isCorrection: boolean = false;

    @Column()
    verifiedByUser: boolean = false;

    @ManyToOne(type => Ngo, ngo => ngo.transactions)
    @JoinColumn()
    ngo: Ngo;

    @ManyToOne(type => Cart, cart => cart.transactions)
    @JoinColumn()
    cart: Cart;

    @ManyToOne(type => TradingPoint, tradingPoint => tradingPoint.transactions)
    tradingPoint: TradingPoint;

    @ManyToOne(type => User, user => user.transactions)
    user: User;

    @CreateDateColumn()
    createdAt: Date;

}
