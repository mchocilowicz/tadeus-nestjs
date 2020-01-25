import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {Ngo} from "./ngo.entity";
import {User} from "./user.entity";
import {DonationEnum, PoolEnum} from "../../common/enum/donation.enum";
import {TadeusEntity} from "./base.entity";
import {Period} from "./period.entity";
import {ColumnNumericTransformer} from "../../common/util/number-column.transformer";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'DONATION'})
export class Donation extends TadeusEntity {

    @Column({name: 'ID'})
    ID: string;

    @Column({name: 'TYPE', type: 'text'})
    type: DonationEnum;

    @Column({name: 'POOL', type: 'text'})
    pool: PoolEnum;

    @Column({name: 'PAYMENT_NUMBER'})
    paymentNumber: string;

    @Column({name: 'PRICE', type: 'decimal', transformer: new ColumnNumericTransformer()})
    price: number = 0;

    @ManyToOne(type => Ngo, ngo => ngo.donations)
    @JoinColumn({name: 'NGO_SKID'})
    ngo: Ngo;

    @ManyToOne(type => User, user => user.donations)
    @JoinColumn({name: 'USER_SKID'})
    user: User;

    @ManyToOne(type => Period, period => period.donations)
    @JoinColumn({name: 'PERIOD_SKID'})
    period: Period;

    constructor(ID: string, paymentNumber: string, type: DonationEnum, pool: PoolEnum, user: User, period: Period, ngo: Ngo) {
        super();
        this.ID = ID;
        this.type = type;
        this.pool = pool;
        this.user = user;
        this.period = period;
        this.ngo = ngo;
        this.paymentNumber = paymentNumber;
    }

    static getCurrentDonationForUser(user: User, period: Period): Promise<Donation | undefined> {
        return this.createQueryBuilder('donation')
            .leftJoin('donation.user', 'user')
            .leftJoin('donation.period', 'period')
            .where('user.id = :id', {id: user.id})
            .andWhere('period.id = :id', {id: period.id})
            .andWhere('donation.type = :type', {type: DonationEnum.NGO})
            .andWhere('donation.pool = :pool', {pool: 'DONATION'})
            .orderBy('donation.createdAt', 'DESC')
            .take(1)
            .getOne();
    }
}
