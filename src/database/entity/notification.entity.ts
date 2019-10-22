import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { ApiModelProperty } from "@nestjs/swagger";


@Entity({schema: 'tds'})
export class Notification extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    @ApiModelProperty()
    id: string;

    @ManyToOne(type => User, user => user.notifications)
    user: User;

    @Column()
    @ApiModelProperty()
    value: string;

    @CreateDateColumn()
    createdAt: Date;
}
