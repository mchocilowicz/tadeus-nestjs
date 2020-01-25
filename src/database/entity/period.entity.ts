import {Column, Entity, JoinColumn, ManyToOne, OneToMany} from "typeorm";
import {TadeusEntity} from "./base.entity";
import {PartnerPayment} from "./partner-payment.entity";
import {Donation} from "./donation.entity";
import {ColumnNumericTransformer} from "../../common/util/number-column.transformer";
import {Transaction} from "./transaction.entity";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'PERIOD'})
export class Period extends TadeusEntity {
    @Column({name: 'FROM'})
    from: Date;

    @Column({name: 'TO'})
    to: Date;

    @Column({name: 'INTERVAL', transformer: new ColumnNumericTransformer()})
    interval: number;

    @Column({name: 'TYPE'})
    type: string;

    @Column({name: 'IS_CLOSED', default: false})
    isClosed: boolean = false;

    @OneToMany(type => Period, period => period.period)
    calculationPeriods?: Period[];

    @ManyToOne(type => Period, period => period.calculationPeriods)
    @JoinColumn({name: 'PERIOD_SKID'})
    period?: Period;

    @OneToMany(type => Donation, donation => donation.period)
    donations?: Donation[];

    @OneToMany(type => PartnerPayment, payment => payment.period)
    payments?: PartnerPayment[];

    @OneToMany(type => Transaction, transaction => transaction.period)
    transactions?: Transaction[];

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
