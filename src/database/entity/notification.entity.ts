import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";


@Entity({schema: 'tds'})
export class Notification extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => User, user => user.notifications)
    user: User;

    @Column()
    value: string;

    @CreateDateColumn()
    createdAt: Date;
}
