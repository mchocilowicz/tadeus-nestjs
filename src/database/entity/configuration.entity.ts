import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({schema: 'tds'})
export class Configuration extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: 'decimal'})
    minNgoTransfer: number;

    @Column({type: 'decimal'})
    minPersonalPool: number;

    @Column()
    oldClientPaymentAt: Date;

    @Column()
    previousClientPaymentAt: Date;

    @Column()
    currentClientPaymentAt: Date;

    @Column()
    clientInterval: number;

    @Column()
    oldPartnerPaymentAt: Date;

    @Column()
    previousPartnerPaymentAt: Date;

    @Column()
    currentPartnerPaymentAt: Date;

    @Column()
    partnerInterval: number;

    @Column()
    oldNgoPaymentAt: Date;

    @Column()
    previousNgoPaymentAt: Date;

    @Column()
    currentNgoPaymentAt: Date;

    @Column()
    ngoInterval: number;

    @Column()
    type: string = 'MAIN';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
