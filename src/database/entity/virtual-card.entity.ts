import {Column, Entity, Generated} from "typeorm";
import {TadeusEntity} from "./base.entity";
import {ColumnNumericTransformer} from "../../common/util/number-column.transformer";

@Entity({schema: 'tds'})
export class VirtualCard extends TadeusEntity {
    @Column()
    ID: string;

    @Column()
    @Generated("uuid")
    code?: string;

    @Column({type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    donationPool: number = 0;

    @Column({type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    personalPool: number = 0;

    constructor(ID: string) {
        super();
        this.ID = ID;
    }

    updatePool(totalPool: number) {
        const pool = Number(totalPool / 2);
        this.personalPool += pool;
        this.donationPool += pool;
    }
}
