import {Column, Entity, OneToMany, Unique} from "typeorm";
import {Ngo} from "./ngo.entity";
import {TradingPoint} from "./trading-point.entity";
import {TadeusEntity} from "./base.entity";

@Entity({schema: 'tds'})
@Unique(["name"])
export class City extends TadeusEntity {
    @Column()
    name: string;

    @OneToMany(ngo => Ngo, ngo => ngo.city)
    ngoList?: Ngo[];

    @OneToMany(place => TradingPoint, place => place.city)
    places?: TradingPoint[];

    constructor(name: string) {
        super();
        this.name = name;
    }

    static async findWhereNgoExists() {
        return this.createQueryBuilder('city')
            .innerJoin('city.ngoList', 'ngo')
            .getMany()
    }

    static async findWhereTradingPointExists() {
        return this.createQueryBuilder('city')
            .innerJoin('city.places', 'place')
            .getMany()
    }
}
