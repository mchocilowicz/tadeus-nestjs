import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { TradingPoint } from "./trading-point.entity";
import { Transaction } from "./transaction.entity";
import { Payment } from "./payment.entity";


@Entity({schema: 'tds'})
export class Cart extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({default: false})
    isPaid: boolean;

    @Column({nullable: true, type: 'decimal'})
    price: number;

    @Column({nullable: true})
    paymentDate: Date;

    @ManyToOne(type => TradingPoint)
    @JoinColumn()
    tradingPoint: TradingPoint;

    @OneToMany(type => Transaction, transaction => transaction.cart)
    transactions: Transaction[];

    @OneToMany(type => Payment, payment => payment.cart)
    payments: Payment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
