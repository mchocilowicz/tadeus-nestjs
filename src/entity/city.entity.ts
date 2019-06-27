import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Ngo } from "./ngo.entity";
import { Place } from "./place.entity";

@Entity()
@Unique(["name"])
export class City extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    location: string;

    @OneToMany(ngo => Ngo, ngo => ngo.city)
    ngo: Ngo[];

    @OneToMany(place => Place, place => place.city)
    place: City[];
}
