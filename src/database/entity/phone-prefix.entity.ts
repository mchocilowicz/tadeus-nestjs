import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(['value', 'code'])
export class PhonePrefix extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    value: string;

    @Column()
    code: string;

    @Column()
    maxLength: number;
}
