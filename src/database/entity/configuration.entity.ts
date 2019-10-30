import { Column, Entity } from "typeorm";
import { TadeusEntity } from "./base.entity";

@Entity({schema: 'tds'})
export class Configuration extends TadeusEntity {

    @Column({type: 'decimal'})
    minNgoTransfer: number = 0;

    @Column({type: 'decimal'})
    minPersonalPool: number = 0;

    @Column()
    userExpirationAfterDays: number = 365;

    @Column()
    oldClientPaymentAt?: Date;

    @Column()
    previousClientPaymentAt?: Date;

    @Column()
    currentClientPaymentAt?: Date;

    @Column()
    clientInterval: number = 1;

    @Column()
    oldPartnerPaymentAt?: Date;

    @Column()
    previousPartnerPaymentAt?: Date;

    @Column()
    currentPartnerPaymentAt?: Date;

    @Column()
    partnerInterval: number = 1;

    @Column()
    oldNgoPaymentAt?: Date;

    @Column()
    previousNgoPaymentAt?: Date;

    @Column()
    currentNgoPaymentAt?: Date;

    @Column()
    ngoInterval: number = 1;

    @Column()
    type: string = 'MAIN';
}
