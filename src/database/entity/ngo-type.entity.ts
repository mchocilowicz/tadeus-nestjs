import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ApiModelProperty } from "@nestjs/swagger";
import { Ngo } from "./ngo.entity";

@Entity({schema: 'tds'})
@Unique(["name"])
export class NgoType extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    @ApiModelProperty()
    id: string;

    @Column()
    code: number;

    @Column()
    @ApiModelProperty()
    name: string;

    @OneToMany(ngo => Ngo, ngo => ngo.type)
    ngoList: Ngo[];
}
