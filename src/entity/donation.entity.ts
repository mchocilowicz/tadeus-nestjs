import { BaseEntity, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Donation extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;
}
