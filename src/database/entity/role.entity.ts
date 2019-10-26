import { Column, Entity, OneToMany } from "typeorm";
import { Account } from "./account.entity";
import { TadeusEntity } from "./base.entity";

@Entity({schema: 'tds'})
export class Role extends TadeusEntity {

    @Column({unique: true})
    value: string;

    @OneToMany(account => Account, account => account.role)
    accounts?: Account[];

    constructor(value: string) {
        super();
        this.value = value;
    }
}
