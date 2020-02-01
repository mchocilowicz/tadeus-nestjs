import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {Ngo} from "./ngo.entity";
import {User} from "./user.entity";
import {DonationEnum, PoolEnum} from "../../common/enum/donation.enum";
import {TadeusEntity} from "./base.entity";
import {ColumnNumericTransformer} from "../../common/util/number-column.transformer";
import {UserPeriod} from "./user-period.entity";
import {NgoPeriod} from "./ngo-period.entity";

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

    @ManyToOne(type => UserPeriod, period => period.donations)
    @JoinColumn({name: 'USER_PERIOD_SKID'})
    userPeriod: UserPeriod;

    @ManyToOne(type => NgoPeriod, period => period.donations)
    @JoinColumn({name: 'NGO_PERIOD_SKID'})
    ngoPeriod?: NgoPeriod;

    constructor(ID: string, paymentNumber: string, type: DonationEnum, pool: PoolEnum, user: User, period: UserPeriod, ngo: Ngo) {
        super();
        this.ID = ID;
        this.type = type;
        this.pool = pool;
        this.user = user;
        this.userPeriod = period;
        this.ngo = ngo;
        this.paymentNumber = paymentNumber;
    }
}
