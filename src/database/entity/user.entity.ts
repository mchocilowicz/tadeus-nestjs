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
import { VirtualCard } from "./virtual-card.entity";
import { Ngo } from "./ngo.entity";
import { TradingPoint } from "./trading-point.entity";
import { Transaction } from "./transaction.entity";
import { Donation } from "./donation.entity";
import { Status } from "../../common/enum/status.enum";

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

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

    @Column()
    xp: number = 0;

    @Column({type: 'decimal'})
    donationPool: number = 0;

    @Column({type: 'decimal'})
    personalPool: number = 0;

    @Column()
    ngoSelectionCount: number = 0;

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

    @OneToOne(type => VirtualCard)
    @JoinColumn()
    virtualCard: VirtualCard;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;
}
