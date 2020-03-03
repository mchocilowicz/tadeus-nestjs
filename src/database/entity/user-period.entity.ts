import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { TadeusEntity } from "./base.entity";
import { Donation } from "./donation.entity";
import { Transaction } from "./transaction.entity";
import { NgoPeriod } from "./ngo-period.entity";
import { PartnerPeriod } from "./partner-period.entity";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'USER_PERIOD'})
export class UserPeriod extends TadeusEntity {
    @Column({name: 'FROM'})
    from: Date;

    @Column({name: 'TO'})
    to: Date;

    @Column({name: 'IS_CLOSED', default: false})
    isClosed: boolean = false;

    @ManyToOne(type => NgoPeriod, period => period.userPeriods)
    @JoinColumn({name: 'NGO_PERIOD_SKID'})
    ngoPeriod?: NgoPeriod;

    @ManyToOne(type => PartnerPeriod, period => period.userPeriods)
    @JoinColumn({name: 'PARTNER_PERIOD_SKID'})
    partnerPeriod?: PartnerPeriod;

    @OneToMany(type => Donation, donation => donation.userPeriod)
    donations?: Donation[];

    @OneToMany(type => Transaction, transaction => transaction.userPeriod)
    transactions?: Transaction[];

    constructor(from: Date, to: Date) {
        super();
        this.from = from;
        this.to = to;
    }

    static findActivePeriod(): Promise<UserPeriod | undefined> {
        return this.createQueryBuilder("p")
            .where("p.isClosed = false")
            .getOne()
    }

    static findPeriodsToClose(date: String): Promise<UserPeriod[]> {
        return this.createQueryBuilder('p')
            .where('p.isClosed = false')
            .andWhere("to_char(p.to,'YYYY-MM-DD') = :date", {date: date})
            .orderBy('p.to', 'DESC')
            .getMany();
    }
}
