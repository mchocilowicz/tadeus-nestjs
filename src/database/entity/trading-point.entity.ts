import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from "typeorm";
import { TradingPointType } from "./trading-point-type.entity";
import { City } from "./city.entity";
import { Transaction } from "./transaction.entity";
import { Cart } from "./cart.entity";
import { Payment } from "./payment.entity";
import { Terminal } from "./terminal.entity";
import { Phone } from "./phone.entity";
import { TadeusEntity } from "./base.entity";

@Entity({schema: 'tds'})
@Unique(["name"])
export class TradingPoint extends TadeusEntity {
    @Column()
    ID: string;

    @Column()
    name: string;

    @Column({type: "decimal"})
    donationPercentage: number;

    @Column({type: "decimal"})
    vat: number = 23;

    @Column({type: "decimal"})
    fee: number = 0.66;

    @Column({nullable: true})
    image: string = 'icon.jpg';

    @Column({type: "decimal"})
    longitude: number;

    @Column({type: "decimal"})
    latitude: number;

    @Column()
    address: string;

    @Column()
    postCode: string;

    @Column()
    xp: number = 0;

    @Column({nullable: true})
    distance?: number;

    @Column("geometry", {
        nullable: true,
        spatialFeatureType: "Point",
        srid: 4326
    })
    coordinate?: object;

    @Column({default: false})
    active: boolean = false;

    @Column({nullable: true})
    closedAt?: Date;

    @ManyToOne(type => TradingPointType, {nullable: false})
    @JoinColumn()
    type: TradingPointType;

    @ManyToOne(type => Phone)
    @JoinColumn()
    phone: Phone;

    @ManyToOne(type => City)
    @JoinColumn()
    city: City;

    @OneToMany(type => Terminal, terminal => terminal.tradingPoint)
    terminals?: Terminal[];

    @OneToMany(type => Cart, cart => cart.tradingPoint)
    cartList?: Cart[];

    @OneToMany(type => Payment, payment => payment.tradingPoint)
    payments?: Payment[];

    @OneToMany(type => Transaction, transactions => transactions.tradingPoint)
    transactions?: Transaction[];

    constructor(ID: string,
                name: string,
                donationPercentage: number,
                longitude: number,
                latitude: number,
                phone: Phone,
                type: TradingPointType,
                city: City,
                address: string,
                postCode: string) {
        super();
        this.ID = ID;
        this.name = name;
        this.donationPercentage = donationPercentage;
        this.longitude = longitude;
        this.latitude = latitude;
        this.phone = phone;
        this.type = type;
        this.city = city;
        this.address = address;
        this.postCode = postCode;
    }

    @BeforeInsert()
    assignPointData() {
        this.coordinate = {
            type: "Point",
            coordinates: [this.longitude, this.latitude]
        };
    }
}
