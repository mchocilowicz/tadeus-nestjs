import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { TradingPoint } from "./trading-point.entity";
import { Ngo } from "./ngo.entity";
import { BusinessArea } from "./business-area.entity";
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
    xp: number;

    @Column()
    isCorrection: boolean = false;

    @ManyToOne(type => Ngo, ngo => ngo.transactions)
    @JoinColumn()
    ngo: Ngo;

    @ManyToOne(type => BusinessArea)
    @JoinColumn()
    cart: Cart;

    @ManyToOne(type => TradingPoint, tradingPoint => tradingPoint.transactions)
    tradingPoint: TradingPoint;

    @Column({type: 'date'})
    transactionDay;

    @ManyToOne(type => User, user => user.transactions)
    user: User;

    @CreateDateColumn()
    createdAt: Date;

}
