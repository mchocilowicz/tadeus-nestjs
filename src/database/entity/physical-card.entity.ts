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
import { Ngo } from "./ngo.entity";

@Entity()
export class PhysicalCard extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    ID: string;

    @Column()
    @Generated("uuid")
    code: string;

    @Column({type: 'decimal', default: 0})
    collectedMoney: number;

    @OneToMany(type => Ngo, ngo => ngo.card)
    ngoList: Ngo[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
