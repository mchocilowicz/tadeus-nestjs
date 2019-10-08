import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Configuration extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: 'decimal'})
    minNgoTransfer: number;

    @Column({type: 'decimal'})
    minPersonalPool: number;

    @Column()
    oldClientPaymentDate: Date;

    @Column()
    currentClientPaymentDate: Date;

    @Column()
    clientCycleDays: number;

    @Column()
    nextClientPaymentDate: Date;

    @Column()
    oldPartnerPaymentDate: Date;

    @Column()
    currentPartnerPaymentDate: Date;

    @Column()
    partnerCycleDays: number;

    @Column()
    nextPartnerPaymentDate: Date;

    @Column()
    oldNgoPaymentDate: Date;

    @Column()
    currentNgoPaymentDate: Date;

    @Column()
    ngoCycleDays: number;

    @Column()
    nextNgoPaymentDate: Date;

    @Column()
    type: string = 'MAIN';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
