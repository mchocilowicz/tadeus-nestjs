import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Ngo } from "./ngo.entity";
import { TradingPoint } from "./trading-point.entity";
import { ApiModelProperty } from "@nestjs/swagger";

@Entity()
@Unique(["name"])
export class City extends BaseEntity {

    @ApiModelProperty()
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @ApiModelProperty()
    name: string;

    @Column()
    @ApiModelProperty()
    location: string;

    @OneToMany(ngo => Ngo, ngo => ngo.city)
    ngo: Ngo[];

    @OneToMany(place => TradingPoint, place => place.city)
    place: City[];
}
