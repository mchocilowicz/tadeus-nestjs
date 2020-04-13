import {TadeusEntity} from "./base.entity";
import {BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany} from "typeorm";
import {City} from "./city.entity";
import {Ngo} from "./ngo.entity";
import {TradingPoint} from "./trading-point.entity";
import {ColumnNumericTransformer} from "../common/util/number-column.transformer";

@Entity({name: 'ADDRESS'})
export class Address extends TadeusEntity {
    @Column({name: 'STREET'})
    street: string;

    @Column({name: 'NUMBER', transformer: new ColumnNumericTransformer()})
    number: number;

    @Column({name: 'POST_CODE'})
    postCode: string;

    @Column({name: 'LONGITUDE', type: "decimal", transformer: new ColumnNumericTransformer()})
    longitude: number;

    @Column({name: 'LATITUDE', type: "decimal", transformer: new ColumnNumericTransformer()})
    latitude: number;

    @Column({name: 'DISTANCE', type: "decimal", transformer: new ColumnNumericTransformer()})
    distance: number = 0;

    @Column("geometry", {
        nullable: true,
        spatialFeatureType: "Point",
        srid: 4326,
        name: 'COORDINATE'
    })
    coordinate?: object;

    @OneToMany(ngo => Ngo, ngo => ngo.address)
    ngoList?: Ngo[];

    @OneToMany(point => TradingPoint, point => point.address)
    tradingPointList?: TradingPoint[];

    @ManyToOne(type => City)
    @JoinColumn({name: 'CITY_SKID'})
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
