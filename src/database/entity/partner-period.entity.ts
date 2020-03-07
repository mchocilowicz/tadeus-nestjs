import {Column, Entity, JoinColumn, ManyToOne, OneToMany} from "typeorm";
import {TadeusEntity} from "./base.entity";
import {PartnerPayment} from "./partner-payment.entity";
import {Transaction} from "./transaction.entity";
import {NgoPeriod} from "./ngo-period.entity";
import {UserPeriod} from "./user-period.entity";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'PARTNER_PERIOD'})
export class PartnerPeriod extends TadeusEntity {

    @Column({name: 'FROM'})
    from: Date;

    @Column({name: 'TO'})
    to: Date;

    @Column({name: 'IS_CLOSED', default: false})
    isClosed: boolean = false;

    @Column({name: 'IS_EDITABLE', default: false})
    isEditable: boolean = false;

    @Column({name: 'SEND_MESSAGES_AT', nullable: true})
    sendMessagesAt?: Date;

    @Column({name: 'NOT_EDITABLE_AT', nullable: true})
    notEditableAt?: Date;

    @Column({name: 'CLOSED_AT', nullable: true})
    closedAt?: Date;

    @ManyToOne(type => NgoPeriod, period => period.partnerPeriods)
    @JoinColumn({name: 'NGO_PERIOD_SKID'})
    ngoPeriod?: NgoPeriod;

    @OneToMany(type => PartnerPayment, payment => payment.partnerPeriod)
    payments?: PartnerPayment[];

    @OneToMany(type => Transaction, transaction => transaction.partnerPeriod)
    transactions?: Transaction[];

    @OneToMany(type => UserPeriod, period => period.partnerPeriod)
    userPeriods?: UserPeriod[];

    constructor(from: Date, to: Date) {
        super();
        this.from = from;
        this.to = to;
    }

    static findActivePeriod(): Promise<PartnerPeriod | undefined> {
        return this.createQueryBuilder("p")
            .leftJoinAndSelect("p.payments", 'payment')
            .where("p.isClosed = false")
            .andWhere("p.ngoPeriod is null")
            .getOne();
    }
}
