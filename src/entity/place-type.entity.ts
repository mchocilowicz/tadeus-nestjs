import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Place } from "./place.entity";
import { ApiModelProperty } from "@nestjs/swagger";

@Entity()
export class PlaceType extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    @ApiModelProperty()
    id: string;

    @Column()
    @ApiModelProperty()
    name: string;

    @OneToMany(place => Place, place => place.type)
    places: Place[];
}
