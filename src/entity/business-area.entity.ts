import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Ngo } from "./ngo.entity";

@Entity()
export class BusinessArea extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @OneToMany(ngo => Ngo, ngo => ngo.businessArea)
    ngoList: Ngo[];
}
