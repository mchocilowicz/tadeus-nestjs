import {Column, Entity, Generated, OneToMany} from "typeorm";
import {ApiModelProperty} from "@nestjs/swagger";
import {TradingPoint} from "./trading-point.entity";
import {TadeusEntity} from "./base.entity";

@Entity({schema: 'tds'})
export class TradingPointType extends TadeusEntity {
    @Column()
    @ApiModelProperty()
    name: string;

    @Generated("increment")
    code: number = 0;

    @OneToMany(place => TradingPoint, tradingPoint => tradingPoint.type)
    tradingPoints?: TradingPoint[];

    constructor(name: string) {
        super();
        this.name = name;
    }
}
