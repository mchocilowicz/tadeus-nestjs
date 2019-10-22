import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({schema: 'tds'})
export class Opinion extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    value: string;

    @Column()
    email: string;

    @ManyToOne(type => User, user => user.opinions)
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}
