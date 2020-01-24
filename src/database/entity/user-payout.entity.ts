import {Column, Entity, ManyToOne} from "typeorm";
import {TadeusEntity} from "./base.entity";
import {User} from "./user.entity";
import {ColumnNumericTransformer} from "../../common/util/number-column.transformer";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'USER_PAYOUT'})
export class UserPayout extends TadeusEntity {
    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    accountNumber: string;

    @Column({type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    price: number = 0;

    readonly class: string = 'PAYOUT';

    @ManyToOne(type => User, user => user.payouts)
    @JoinColumn({name: 'USER_SKID'})
    user: User;

    constructor(firstName: string, lastName: string, account: string, user: User) {
        super();
        this.firstName = firstName;
        this.lastName = lastName;
        this.accountNumber = account;
        this.user = user;
    }

}
