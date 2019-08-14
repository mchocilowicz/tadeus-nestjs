import {
    BaseEntity,
    BeforeInsert,
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
import { TradingPointType } from "./trading-point-type.entity";
import { City } from "./city.entity";
import { User } from "./user.entity";
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

    @ManyToOne(type => TradingPointType, {nullable: false})
    @JoinColumn()
    type: TradingPointType;

    @OneToMany(type => Transaction, transactions => transactions.tradingPoint)
    transactions: Transaction[];

    @Column()
    name: string;

    @Column({type: "decimal"})
    donationPercentage: number;

    @Column({type: "decimal"})
    vat: number;

    @Column({type: "decimal"})
    manipulationFee: number = 0.66;

    @ManyToOne(type => City, {nullable: false})
    @JoinColumn()
    city: City;

    @Column({type: "decimal"})
    longitude: number;

    @Column({type: "decimal"})
    latitude: number;

    @Column("geometry", {
        nullable: true,
        spatialFeatureType: "Point",
        srid: 4326
    })
    coordinate: object;

    @Column()
    address: string;

    @Column()
    postCode: string;

    @Column()
    xp: number = 0;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;


    @BeforeInsert()
    assignPointData() {
        this.coordinate = {
            type: "Point",
            coordinates: [this.longitude, this.latitude]
        };
    }
}
