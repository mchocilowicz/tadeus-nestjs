import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { NgoType } from "./ngo-type.entity";
import { City } from "./city.entity";
import { User } from "./user.entity";
import { Transaction } from "./transaction.entity";
import { Donation } from "./donation.entity";

@Entity()
export class Ngo extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    bankNumber: string;

    @Column()
    phone: string;

    @Column()
    email: string;

    @Column()
    verified: boolean = false;

    @Column({nullable: true})
    verificationDate: Date;

    @Column()
    location: string;

    @Column()
    name: string;

    @Column()
    address: string;

    @Column({nullable: true})
    totalDonation: number = 0;

    @Column({nullable: true})
    lastDonation: number = 0;

    @ManyToOne(type => City, {nullable: false})
    @JoinColumn()
    city: City;

    @ManyToOne(type => NgoType, {nullable: false})
    @JoinColumn()
    type: NgoType;

    @OneToMany(type => Transaction, transactions => transactions.ngo)
    transactions: Transaction[];

    @OneToMany(type => User, user => user.ngo)
    user: User[];

    @OneToMany(type => Donation, donation => donation.ngo)
    donations: Donation[];

    @CreateDateColumn()
    creationDate: Date
}
