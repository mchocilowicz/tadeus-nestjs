import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ApiModelProperty } from "@nestjs/swagger";
import { TradingPoint } from "./trading-point.entity";

@Entity({schema: 'tds'})
@Unique(["name"])
export class TradingPointType extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    @ApiModelProperty()
    id: string;

    @Column()
    @ApiModelProperty()
    name: string;

    @Column()
    code: number;

    @OneToMany(place => TradingPoint, tradingPoint => tradingPoint.type)
    tradingPoints: TradingPoint[];
}
