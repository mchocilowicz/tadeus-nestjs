import {Column, Entity, Generated, OneToMany, Unique} from "typeorm";
import {ApiModelProperty} from "@nestjs/swagger";
import {Ngo} from "./ngo.entity";
import {TadeusEntity} from "./base.entity";

@Entity({schema: 'tds'})
@Unique(["name"])
export class NgoType extends TadeusEntity {

    @Column()
    @ApiModelProperty()
    name: string;

    @Column()
    @Generated("increment")
    code: number = 0;

    @OneToMany(ngo => Ngo, ngo => ngo.type)
    ngoList?: Ngo[];

    constructor(name: string) {
        super();
        this.name = name;
    }
}
