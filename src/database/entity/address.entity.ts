import { TadeusEntity } from "./base.entity";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { City } from "./city.entity";
import { Ngo } from "./ngo.entity";
import { TradingPoint } from "./trading-point.entity";
import { ColumnNumericTransformer } from "../../common/util/number-column.transformer";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'ADDRESS'})
export class Address extends TadeusEntity {
    @Column()
    street: string;

    @Column({transformer: new ColumnNumericTransformer()})
    number: number;

    @Column()
    postCode: string;

    @Column({type: "decimal", transformer: new ColumnNumericTransformer()})
    longitude: number;

    @Column({type: "decimal", transformer: new ColumnNumericTransformer()})
    latitude: number;

    @Column({type: "decimal", transformer: new ColumnNumericTransformer()})
    distance: number = 0;

    @Column("geometry", {
        nullable: true,
        spatialFeatureType: "Point",
        srid: 4326
    })
    coordinate?: object;

    @OneToMany(ngo => Ngo, ngo => ngo.address)
    ngoList?: Ngo[];

    @OneToMany(point => TradingPoint, point => point.address)
    tradingPointList?: TradingPoint[];

    @ManyToOne(type => City)
    @JoinColumn()
    city: City;

    constructor(street: string, number: number, postCode: string, city: City, longitude: number, latitude: number) {
        super();
        this.street = street;
        this.number = number;
        this.city = city;
        this.longitude = longitude;
        this.latitude = latitude;
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