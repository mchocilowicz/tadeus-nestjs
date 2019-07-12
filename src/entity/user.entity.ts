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
    Unique,
    UpdateDateColumn
} from "typeorm";
import { RoleEnum } from "../common/enum/role.enum";
import { TradingPoint } from "./trading-point.entity";
import { Transaction } from "./transaction.entity";
import { Ngo } from "./ngo.entity";
import { VirtualCard } from "./virtual-card.entity";
import { Donation } from "./donation.entity";

@Entity()
@Unique(["phone"])
export class User extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    phone: string;

    @Column({nullable: true})
    name: string;

    @Column({nullable: true})
    code: number;

    @Column({nullable: true})
    email: string;

    @Column()
    collectedMoney: number = 0;

    @Column()
    blocked: boolean = false;

    @Column()
    registered: boolean = false;

    @Column()
    xp: number = 0;

    @Column()
    donationPool: number = 0;

    @Column()
    personalPool: number = 0;

    @Column('text')
    role: RoleEnum;

    @Column()
    ngoSelectionCount: number = 0;

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

    @OneToOne(type => VirtualCard)
    @JoinColumn()
    virtualCard: VirtualCard;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;
}
