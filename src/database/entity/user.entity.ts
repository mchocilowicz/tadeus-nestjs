import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { Role } from "./role.entity";
import { Ngo } from "./ngo.entity";
import { TradingPoint } from "./trading-point.entity";
import { Transaction } from "./transaction.entity";
import { Donation } from "./donation.entity";
import { Status, Step } from "../../common/enum/status.enum";
import { Card } from "./card.entity";

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    ID: string;

    @Column({nullable: true, unique: true})
    phone: string;

    @Column({nullable: true})
    name: string;

    @Column({nullable: true})
    code: number;

    @Column({nullable: true})
    email: string;

    @Column({type: 'decimal'})
    collectedMoney: number = 0;

    @Column()
    registered: boolean = false;

    @Column({type: 'text', default: Status.ACTIVE})
    status: Status;

    @Column({type: 'text', nullable: true})
    step: Step;

    @Column()
    xp: number = 0;

    @Column({type: 'decimal'})
    donationPool: number = 0;

    @Column({type: 'decimal'})
    personalPool: number = 0;

    @Column()
    ngoSelectionCount: number = 0;

    @Column({nullable: true})
    terminalID: string;

    @Column({nullable: true})
    token: string;

    @ManyToMany(type => Role)
    @JoinTable({name: "user_role"})
    roles: Role[];

    @ManyToOne(type => Ngo)
    @JoinTable()
    ngo: Ngo;

    @ManyToOne(type => TradingPoint)
    @JoinColumn()
    tradingPoint: TradingPoint;

    @OneToMany(type => Transaction, transactions => transactions.user)
    transactions: Transaction[];

    @OneToMany(type => Donation, donation => donation.user)
    donations: Donation[];

    @OneToOne(type => Card)
    @JoinColumn()
    card: Card;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;
}
