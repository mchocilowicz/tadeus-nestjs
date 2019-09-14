import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { Role } from "./role.entity";
import { User } from "./user.entity";
import { Status } from "../../common/enum/status.enum";

@Entity()
export class Account extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    ID: string;

    @Column({nullable: true})
    code: number;

    @Column({nullable: true})
    token: string;

    @Column({type: 'text', default: Status.ACTIVE})
    status: Status;

    @ManyToOne(type => Role, {nullable: false})
    @JoinColumn()
    role: Role;

    @ManyToOne(type => User, user => user.accounts)
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
