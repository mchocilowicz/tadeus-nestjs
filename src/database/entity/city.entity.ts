import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Ngo } from "./ngo.entity";
import { ApiModelProperty } from "@nestjs/swagger";
import { TradingPoint } from "./trading-point.entity";

@Entity({schema: 'tds'})
@Unique(["name"])
export class City extends BaseEntity {

    @ApiModelProperty()
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @ApiModelProperty()
    name: string;

    @OneToMany(ngo => Ngo, ngo => ngo.city)
    ngoList: Ngo[];

    @OneToMany(place => TradingPoint, place => place.city)
    places: TradingPoint[];
}
