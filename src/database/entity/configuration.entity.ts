import {Column, Entity} from "typeorm";
import {TadeusEntity} from "./base.entity";

@Entity({schema: 'tds'})
export class Configuration extends TadeusEntity {

    @Column({type: 'decimal'})
    minNgoTransfer: number = 0;

    @Column({type: 'decimal'})
    minPersonalPool: number = 0;

    @Column()
    userExpirationAfterDays: number = 365;

    @Column()
    type: string = 'MAIN';

    constructor(
        ngoTransfer: number,
        minPersonalPool: number,
        userExpiration: number
    ) {
        super();
        this.minNgoTransfer = ngoTransfer;
        this.minPersonalPool = minPersonalPool;
        this.userExpirationAfterDays = userExpiration;
    }
}
