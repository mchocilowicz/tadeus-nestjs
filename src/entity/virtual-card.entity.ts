import { Column, Entity, Generated } from "typeorm";
import { TadeusEntity } from "./base.entity";
import { NumberColumnTransformer } from "../common/util/number-column.transformer";
import { Tier } from "../common/enum/tier";

@Entity({name: 'VIRTUAL_CARD'})
export class VirtualCard extends TadeusEntity {
    @Column({name: "ID"})
    ID: string;

    @Column({name: "CODE"})
    @Generated("uuid")
    code?: string;

    @Column({
        name: "DONATION_POOL",
        type: 'decimal',
        default: 0,
        transformer: new NumberColumnTransformer()
    }) donationPool: number = 0;

    @Column({
        name: "PERSONAL_POOL",
        type: 'decimal',
        default: 0,
        transformer: new NumberColumnTransformer()
    }) personalPool: number = 0;

    @Column({ name: "STATUS" }) status: string = 'NOT_ACTIVE';

    @Column({ name: 'TIER', type: 'text', default: Tier.RUBIN }) tier: Tier = Tier.RUBIN;

    @Column({ name: 'EXPIRED_AT', nullable: true }) expiredAt?: Date;

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
