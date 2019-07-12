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
import { City } from "./city.entity";
import { NgoType } from "./ngo-type.entity";
import { BusinessArea } from "./business-area.entity";
import { Transaction } from "./transaction.entity";
import { User } from "./user.entity";
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

    @ManyToOne(type => City)
    @JoinColumn()
    city: City;

    @ManyToOne(type => NgoType)
    @JoinColumn()
    type: NgoType;

    @ManyToOne(type => BusinessArea)
    @JoinColumn()
    businessArea: BusinessArea;

    @OneToMany(type => Transaction, transactions => transactions.ngo)
    transactions: Transaction[];

    @OneToMany(type => User, user => user.ngo)
    user: User[];

    @OneToMany(type => Donation, donation => donation.user)
    donations: Donation[];

    @CreateDateColumn()
    creationDate: Date
}
