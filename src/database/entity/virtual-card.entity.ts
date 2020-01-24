import { Column, Entity, Generated } from "typeorm";
import { TadeusEntity } from "./base.entity";
import { ColumnNumericTransformer } from "../../common/util/number-column.transformer";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'VIRTUAL_CARD'})
export class VirtualCard extends TadeusEntity {
    @Column({name: "ID"})
    ID: string;

    @Column({name: "CODE"})
    @Generated("uuid")
    code?: string;

    @Column({name: "DONATION_POOL", type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    donationPool: number = 0;

    @Column({name: "PERSONAL_POOL", type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    personalPool: number = 0;

    @Column({name: "STATUS"})
    status: string = 'NOT_ACTIVE';

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
