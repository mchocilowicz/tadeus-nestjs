import { Column, Entity, Generated } from "typeorm";
import { TadeusEntity } from "./base.entity";
import { ColumnNumericTransformer } from "../../common/util/number-column.transformer";

@Entity({schema: 'tds'})
export class PhysicalCard extends TadeusEntity {
    @Column()
    ID: string;

    @Column()
    @Generated("uuid")
    code?: string;

    @Column({type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    collectedMoney: number = 0;

    constructor(ID: string) {
        super();
        this.ID = ID;
    }
}
