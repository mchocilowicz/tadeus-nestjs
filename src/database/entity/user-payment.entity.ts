import { Column, Entity, ManyToOne } from "typeorm";
import { TadeusEntity } from "./base.entity";
import { User } from "./user.entity";

@Entity({schema: 'tds'})
export class UserPayout extends TadeusEntity {
    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    accountNumber: string;

    @Column()
    price: number;

    @Column({default: 'PAYOUT'})
    class: string = 'PAYOUT';

    @ManyToOne(type => User, user => user.payouts)
    user: User;

    constructor(firstName: string, lastName: string, price: number, account: string, user: User) {
        super();
        this.firstName = firstName;
        this.lastName = lastName;
        this.accountNumber = account;
        this.price = price;
        this.user = user;
    }

}
