import { Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { TadeusEntity } from "./base.entity";
import { Phone } from "./phone.entity";
import { Account } from "./account.entity";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'ADMIN'})
export class Admin extends TadeusEntity {
    @ManyToOne(type => Phone)
    @JoinColumn()
    phone: Phone;

    @OneToOne(type => Account)
    @JoinColumn()
    account: Account;

    constructor(phone: Phone, account: Account) {
        super();
        this.phone = phone;
        this.account = account;
    }
}