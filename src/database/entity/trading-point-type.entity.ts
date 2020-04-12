import {Column, Entity, Generated, OneToMany} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";
import {TradingPoint} from "./trading-point.entity";
import {TadeusEntity} from "./base.entity";

@Entity({name: 'PARTNER_TYPE'})
export class TradingPointType extends TadeusEntity {
    @Column({name: 'NAME'})
    @ApiProperty()
    name: string;

    @Column({name: 'CODE'})
    @Generated("increment")
    code: number = 0;

    @OneToMany(place => TradingPoint, tradingPoint => tradingPoint.type)
    tradingPoints?: TradingPoint[];

    constructor(name: string) {
        super();
        this.name = name;
    }
}
