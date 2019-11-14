import { Column, Entity, Generated, OneToMany } from "typeorm";
import { ApiModelProperty } from "@nestjs/swagger";
import { Ngo } from "./ngo.entity";
import { TadeusEntity } from "./base.entity";
import { ColumnNumericTransformer } from "../../common/util/number-column.transformer";

@Entity({schema: 'tds'})
export class NgoType extends TadeusEntity {

    @Column()
    @ApiModelProperty()
    name: string;

    @Column({transformer: new ColumnNumericTransformer()})
    @Generated("increment")
    code: number = 0;

    @OneToMany(ngo => Ngo, ngo => ngo.type)
    ngoList?: Ngo[];

    constructor(name: string) {
        super();
        this.name = name;
    }
}
