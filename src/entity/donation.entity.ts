import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Ngo } from "./ngo.entity";

@Entity()
export class Donation extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    value: number;

    @ManyToOne(type => Ngo, ngo => ngo.donations)
    ngo: Ngo;

    @ManyToOne(type => User, user => user.donations)
    user: User;
}
