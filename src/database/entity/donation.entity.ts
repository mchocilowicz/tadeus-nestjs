import { Column, Entity, ManyToOne } from "typeorm";
import { Ngo } from "./ngo.entity";
import { User } from "./user.entity";
import { DonationEnum } from "../../common/enum/donation.enum";
import { TadeusEntity } from "./base.entity";

@Entity({schema: 'tds'})
export class Donation extends TadeusEntity {

    @Column()
    ID: string;

    @Column({nullable: true})
    invoiceNumber?: string;

    @Column({type: 'text'})
    type: DonationEnum;

    @Column({type: 'text'})
    pool: string;

    @Column({type: 'decimal'})
    price: number;

    @Column({default: false})
    isPaid: boolean = false;

    @Column({nullable: true})
    payedAt?: Date;

    @ManyToOne(type => Ngo, ngo => ngo.donations, {nullable: false})
    ngo: Ngo;

    @ManyToOne(type => User, user => user.donations, {nullable: false})
    user: User;

    constructor(ID: string, type: DonationEnum, pool: string, price: number, ngo: Ngo, user: User) {
        super();
        this.ID = ID;
        this.type = type;
        this.pool = pool;
        this.price = price;
        this.ngo = ngo;
        this.user = user;
    }
}
