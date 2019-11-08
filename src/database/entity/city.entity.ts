import {Column, Entity, OneToMany, Unique} from "typeorm";
import {TadeusEntity} from "./base.entity";
import {Address} from "./address.entity";

@Entity({schema: 'tds'})
@Unique(["name"])
export class City extends TadeusEntity {
    @Column()
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
