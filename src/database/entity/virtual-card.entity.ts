import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Generated,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";

@Entity({schema: 'tds'})
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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
