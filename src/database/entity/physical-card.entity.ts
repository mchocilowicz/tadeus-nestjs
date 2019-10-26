import { Column, Entity, Generated } from "typeorm";
import { TadeusEntity } from "./base.entity";

@Entity({schema: 'tds'})
export class PhysicalCard extends TadeusEntity {
    @Column()
    ID: string;

    @Column()
    @Generated("uuid")
    code?: string;

    @Column({type: 'decimal', default: 0})
    collectedMoney: number = 0;

    constructor(ID: string) {
        super();
        this.ID = ID;
    }
}
