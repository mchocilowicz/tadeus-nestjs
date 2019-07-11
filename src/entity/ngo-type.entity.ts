import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Ngo } from "./ngo.entity";
import { ApiModelProperty } from "@nestjs/swagger";

@Entity()
@Unique(["name"])
export class NgoType extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    @ApiModelProperty()
    id: string;

    @Column()
    @ApiModelProperty()
    name: string;

    @OneToMany(ngo => Ngo, ngo => ngo.type)
    ngoList: Ngo[];
}
