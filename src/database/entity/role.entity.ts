import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Account } from "./account.entity";

@Entity()
@Unique(["name"])
export class Role extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @OneToMany(account => Account, account => account.role)
    accounts: Account[];
}
