import { Column, Entity, Generated } from "typeorm";
import { TadeusEntity } from "./base.entity";

@Entity({schema: 'tds'})
export class VirtualCard extends TadeusEntity {
    @Column()
    ID: string;

    @Column()
    @Generated("uuid")
    code?: string;

    @Column({type: 'decimal'})
    donationPool: number = 0;

    @Column({type: 'decimal'})
    personalPool: number = 0;

    constructor(ID: string) {
        super();
        this.ID = ID;
    }
}
