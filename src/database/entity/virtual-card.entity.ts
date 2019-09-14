import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Generated,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { User } from "./user.entity";

@Entity()
export class VirtualCard extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    ID: string;

    @Column()
    @Generated("uuid")
    code: string;

    @Column({type: 'decimal'})
    donationPool: number = 0;

    @Column({type: 'decimal'})
    personalPool: number = 0;

    @OneToMany(type => User, user => user.card)
    user: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
