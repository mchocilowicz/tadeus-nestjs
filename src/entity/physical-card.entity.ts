import { Column, Entity, Generated } from "typeorm";
import { TadeusEntity } from "./base.entity";
import { NumberColumnTransformer } from "../common/util/number-column.transformer";

@Entity({name: 'PHYSICAL_CARD'})
export class PhysicalCard extends TadeusEntity {
    @Column({name: 'ID'})
    ID: string;

    @Column({name: 'CODE'})
    @Generated("uuid")
    code?: string;

    @Column({name: 'COLLECTED_MONEY', type: 'decimal', default: 0, transformer: new NumberColumnTransformer()})
    collectedMoney: number = 0;

    constructor(ID: string) {
        super();
        this.ID = ID;
    }
}
