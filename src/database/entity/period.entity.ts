import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { TadeusEntity } from "./base.entity";
import { PartnerPayment } from "./partner-payment.entity";
import { Donation } from "./donation.entity";
import { ColumnNumericTransformer } from "../../common/util/number-column.transformer";
import { Transaction } from "./transaction.entity";
import { NgoPayout } from "./ngo-payout.entity";

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

    @Column({name: 'MESSAGES_SEND_AT'})
    messagesSendAt?: Date;

    @OneToMany(type => Period, period => period.period)
    calculationPeriods?: Period[];

    @ManyToOne(type => Period, period => period.calculationPeriods)
    @JoinColumn({name: 'PERIOD_SKID'})
    period?: Period;

    @OneToMany(type => Donation, donation => donation.period)
    donations?: Donation[];

    @OneToMany(type => PartnerPayment, payment => payment.period)
    payments?: PartnerPayment[];

    @OneToMany(type => NgoPayout, payout => payout.period)
    payouts?: NgoPayout[];

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
        return this.createQueryBuilder('p')
            .where("p.type = 'NGO'")
            .andWhere("p.isClosed = false")
            .getOne();
    }

    static async findCurrentClientPeriod() {
        return this.createQueryBuilder('p')
            .where("p.type = 'CLIENT'")
            .andWhere("p.isClosed = false")
            .getOne();
    }

    static async findCurrentPartnerPeriod() {
        return this.createQueryBuilder('p')
            .where("p.type = 'PARTNER'")
            .andWhere("p.isClosed = false")
            .getOne();
    }
}
