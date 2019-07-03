import { BaseEntity, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
export class Cart extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;
}
