import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { TadeusEntity } from "./base.entity";
import { User } from "./user.entity";
import { NumberColumnTransformer } from "../common/util/number-column.transformer";
import { TransactionType } from "../common/enum/transaction-type.enum";

@Entity({name: 'USER_PAYOUT'})
export class UserPayout extends TadeusEntity {
    @Column({name: "FIRST_NAME"})
    firstName: string;

    @Column({name: "LAST_NAME"})
    lastName: string;

    @Column({name: "ACCOUNT_NUMBER"})
    accountNumber: string;

    @Column({name: 'PRICE', type: 'decimal', default: 0, transformer: new NumberColumnTransformer()})
    price: number = 0;

    readonly class: TransactionType = TransactionType.PAYOUT;

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
