import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { Ngo } from "./ngo.entity";
import { User } from "./user.entity";

@Entity()
export class UserDetails extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({default: 0})
    xp: number;

    @Column({nullable: true})
    fullName: string;

    @Column({nullable: true})
    bankAccount: number;

    @Column({type: 'decimal', default: 0})
    collectedMoney: number;

    @Column({type: 'decimal', default: 0})
    ngoTempMoney: number;

    @Column({default: 0})
    ngoSelectionCount: number;

    @OneToMany(type => User, user => user.details)
    user: User[];

    @ManyToOne(type => Ngo)
    @JoinTable()
    ngo: Ngo;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
