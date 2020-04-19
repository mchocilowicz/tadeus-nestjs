import {Entity, JoinColumn, ManyToOne, OneToOne} from "typeorm";
import {TadeusEntity} from "./base.entity";
import {Phone} from "./phone.entity";
import {Account} from "./account.entity";

@Entity({name: 'DASHBOARD'})
export class Admin extends TadeusEntity {
    @ManyToOne(type => Phone)
    @JoinColumn({name: 'PHONE_SKID'})
    phone: Phone;

    @OneToOne(type => Account)
    @JoinColumn({name: 'ACCOUNT_SKID'})
    account: Account;

    constructor(phone: Phone, account: Account) {
        super();
        this.phone = phone;
        this.account = account;
    }
}
