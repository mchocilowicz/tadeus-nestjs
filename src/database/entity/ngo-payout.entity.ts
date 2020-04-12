import {Column, Entity, JoinColumn, ManyToOne, OneToMany} from "typeorm";
import {TadeusEntity} from "./base.entity";
import {Ngo} from "./ngo.entity";
import {ColumnNumericTransformer} from "../../common/util/number-column.transformer";
import {Transaction} from "./transaction.entity";
import {NgoPeriod} from "./ngo-period.entity";
import {Donation} from "./donation.entity";

@Entity({name: 'NGO_PAYOUT'})
export class NgoPayout extends TadeusEntity {

    @Column({name: 'PRICE', type: 'decimal', transformer: new ColumnNumericTransformer()})
    price: number;

    @Column({name: 'IS_PAID', default: false})
    isPaid: boolean = false;

    @Column({name: 'PAYMENT_DETAILS', nullable: true})
    paymentDetails?: string;

    @Column({name: 'CAN_DISPLAY', default: false})
    canDisplay: boolean = false;

    @ManyToOne(type => Ngo)
    @JoinColumn({name: 'NGO_SKID'})
    ngo: Ngo;

    @ManyToOne(type => NgoPeriod)
    @JoinColumn({name: 'NGO_PERIOD_SKID'})
    ngoPeriod: NgoPeriod;

    @OneToMany(type => Transaction, transactions => transactions.payout)
    transactions?: Transaction[];

    @OneToMany(type => Donation, donation => donation.payout)
    donations?: Donation[];

    constructor(price: number, ngo: Ngo, period: NgoPeriod) {
        super();
        this.price = price;
        this.ngo = ngo;
        this.ngoPeriod = period;
    }

}
