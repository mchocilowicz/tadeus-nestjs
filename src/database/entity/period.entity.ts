import {Column, Entity, JoinColumn, OneToMany, OneToOne} from "typeorm";
import {TadeusEntity} from "./base.entity";
import {PartnerPayment} from "./partner-payment.entity";
import {Donation} from "./donation.entity";

@Entity({schema: 'tds'})
export class Period extends TadeusEntity {
    @Column()
    from: Date;

    @Column()
    to: Date;

    @Column()
    interval: number;

    @Column()
    type: string;

    @OneToOne(type => Period)
    @JoinColumn()
    relation?: Period;

    // Donation
    @OneToMany(type => Donation, donation => donation.period)
    donations?: Donation[];
    // Transaction

    @OneToMany(type => PartnerPayment, payment => payment.period)
    payments?: PartnerPayment[];

    constructor(from: Date, to: Date, interval: number, type: string) {
        super();
        this.from = from;
        this.to = to;
        this.interval = interval;
        this.type = type;
    }

    static async findCurrentNgoPeriod() {
        return this.findCurrentPeriodFor('NGO')
    }

    static async findCurrentClientPeriod() {
        return this.findCurrentPeriodFor('CLIENT')
    }

    static async findCurrentPartnerPeriod() {
        return this.findCurrentPeriodFor('PARTNER')
    }

    static async findPreviousNgoPeriod() {
        return this.findPreviousPeriodFor('NGO')
    }

    static async findPreviousClientPeriod() {
        return this.findPreviousPeriodFor('CLIENT')
    }

    static async findPreviousPartnerPeriod() {
        return this.findPreviousPeriodFor('PARTNER')
    }


    private static async findPreviousPeriodFor(type: string) {
        return this.createQueryBuilder('period')
            .where('period.type = :type', {type: type})
            .orderBy('period.createdAt', 'DESC')
            .offset(1)
            .take(1)
            .getOne()
    }

    private static async findCurrentPeriodFor(type: string) {
        return this.createQueryBuilder('period')
            .where('period.type = :type', {type: type})
            .orderBy('period.createdAt', 'DESC')
            .take(1)
            .getOne()
    }
}
