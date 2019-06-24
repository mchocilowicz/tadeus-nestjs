import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

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
}
