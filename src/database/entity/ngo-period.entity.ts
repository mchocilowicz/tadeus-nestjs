import {Column, Entity, OneToMany} from "typeorm";
import {TadeusEntity} from "./base.entity";
import {Donation} from "./donation.entity";
import {NgoPayout} from "./ngo-payout.entity";
import {Transaction} from "./transaction.entity";
import {UserPeriod} from "./user-period.entity";
import {PartnerPeriod} from "./partner-period.entity";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'NGO_PERIOD'})
export class NgoPeriod extends TadeusEntity {

    @Column({name: 'FROM'})
    from: Date;

    @Column({name: 'TO'})
    to: Date;

    @Column({name: 'IS_CLOSED', default: false})
    isClosed: boolean = false;

    @OneToMany(type => Donation, donation => donation.ngoPeriod)
    donations?: Donation[];

    @OneToMany(type => NgoPayout, payout => payout.ngoPeriod)
    payouts?: NgoPayout[];

    @OneToMany(type => Transaction, transaction => transaction.ngoPeriod)
    transactions?: Transaction[];

    @OneToMany(type => UserPeriod, period => period.ngoPeriod)
    userPeriods?: UserPeriod[];

    @OneToMany(type => PartnerPeriod, period => period.ngoPeriod)
    partnerPeriods?: PartnerPeriod[];

    constructor(from: Date, to: Date) {
        super();
        this.from = from;
        this.to = to;
    }

    static findActivePeriod(): Promise<NgoPeriod | undefined> {
        return this.createQueryBuilder("p")
            .where("p.isClosed = false")
            .getOne();
    }
}
