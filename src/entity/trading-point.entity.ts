import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn
} from "typeorm";
import { User } from "./user.entity";
import { TradingPointType } from "./trading-point-type.entity";
import { City } from "./city.entity";
import { Transaction } from "./transaction.entity";
import { Cart } from "./cart.entity";

@Entity()
@Unique(["name"])
export class TradingPoint extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToMany(type => User, user => user.tradingPoint)
    user: User[];

    @OneToMany(type => Cart, cart => cart.tradingPoint)
    cartList: Cart[];

    @ManyToOne(type => TradingPointType)
    @JoinColumn()
    type: TradingPointType;

    @OneToMany(type => Transaction, transactions => transactions.tradingPoint)
    transactions: Transaction[];

    @Column()
    name: string;

    @Column()
    defaultDonationPercentage: number;

    @Column()
    defaultVat: number;

    @Column()
    defaultSell: number;

    @ManyToOne(type => City)
    @JoinColumn()
    city: City;

    @Column()
    location: string;

    @Column()
    address: string;

    @Column()
    postCode: string;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;
}
