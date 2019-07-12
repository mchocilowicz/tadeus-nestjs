import { BaseEntity, Column, Entity, Generated, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class VirtualCard extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @Generated("uuid")
    code: string;

    @Column()
    cardNumber: string;
}
