import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TradingPoint } from "./trading-point.entity";
import { ApiModelProperty } from "@nestjs/swagger";

@Entity()
export class TradingPointType extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    @ApiModelProperty()
    id: string;

    @Column()
    @ApiModelProperty()
    name: string;

    @OneToMany(place => TradingPoint, tradingPoint => tradingPoint.type)
    tradingPoints: TradingPoint[];
}
