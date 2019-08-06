import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Configuration extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    minNgoTransfer: number;

    @Column()
    minPersonalPool: number;

    @Column()
    currentClientPaymentDate: Date;

    @Column()
    clientCycleDays: number;

    @Column()
    nextClientPaymentDate: Date;

    @Column()
    currentPartnerPaymentDate: Date;

    @Column()
    partnerCycleDays: number;

    @Column()
    nextPartnerPaymentDate: Date;

    @Column()
    currentNgoPaymentDate: Date;

    @Column()
    ngoCycleDays: number;

    @Column()
    nextNgoPaymentDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
