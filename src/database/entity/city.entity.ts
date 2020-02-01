import {Column, Entity, OneToMany} from "typeorm";
import {TadeusEntity} from "./base.entity";
import {Address} from "./address.entity";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'CITY'})
export class City extends TadeusEntity {
    @Column({name: 'NAME'})
    name: string;

    @OneToMany(address => Address, address => address.city)
    addresses?: Address[];

    constructor(name: string) {
        super();
        this.name = name;
    }

    static async findWhereNgoExists() {
        return this.createQueryBuilder('city')
            .innerJoin('city.addresses', 'address')
            .leftJoin('address.ngoList', 'ngo')
            .getMany()
    }

    static async findWhereTradingPointExists() {
        return this.createQueryBuilder('city')
            .innerJoin('city.addresses', 'address')
            .innerJoin('address.tradingPointList', 'tradingPoint')
            .getMany()
    }
}
