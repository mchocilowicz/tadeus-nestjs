import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Ngo } from "./ngo.entity";

@Entity()
@Unique(["name"])
export class NgoType extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @OneToMany(ngo => Ngo, ngo => ngo.type)
    ngos: Ngo[];
}
