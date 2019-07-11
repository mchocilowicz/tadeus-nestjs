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
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { RoleEnum } from "../common/enum/role.enum";
import { TradingPoint } from "./trading-point.entity";
import { Transaction } from "./transaction.entity";
import { Ngo } from "./ngo.entity";

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({nullable: true})
    phone: string;

    @Column({nullable: true})
    name: string;

    @Column({nullable: true})
    code: number;

    @Column({nullable: true})
    email: string;

    @Column('text')
    role: RoleEnum;

    @ManyToMany(type => Ngo)
    @JoinTable()
    ngoList: Ngo[];

    @ManyToOne(type => TradingPoint)
    @JoinColumn()
    tradingPoint: TradingPoint;

    @OneToMany(type => Transaction, transactions => transactions.ngo)
    transactions: Transaction[];

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;

    @Column()
    blocked: boolean = false;

    @Column()
    registered: boolean = false;


    @Column({nullable: true})
    xp: number = 0;

    @Column({nullable: true})
    donation: number = 0;

    @Column({nullable: true})
    personal: number = 0;


}
