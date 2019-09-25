import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Generated,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";

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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
