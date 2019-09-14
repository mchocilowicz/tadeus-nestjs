import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { Transaction } from "./transaction.entity";
import { Donation } from "./donation.entity";
import { Account } from "./account.entity";
import { UserDetails } from "./user-details.entity";
import { Terminal } from "./terminal.entity";
import { VirtualCard } from "./virtual-card.entity";

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({nullable: true, unique: true})
    phone: string;

    @Column({nullable: true})
    name: string;

    @Column({nullable: true})
    email: string;

    @Column({default: false})
    registered: boolean;

    @Column({default: false})
    isAnonymous: boolean;

    @ManyToOne(type => Account)
    @JoinTable()
    accounts: Account[];

    @OneToMany(type => Transaction, transactions => transactions.user)
    transactions: Transaction[];

    @OneToMany(type => Donation, donation => donation.user)
    donations: Donation[];

    @ManyToOne(type => Terminal)
    @JoinColumn()
    terminal: Terminal;

    @ManyToOne(type => UserDetails)
    @JoinColumn()
    details: UserDetails;

    @OneToOne(type => VirtualCard)
    @JoinColumn()
    card: VirtualCard;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
