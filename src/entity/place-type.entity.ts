import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Place } from "./place.entity";

@Entity()
export class PlaceType extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @OneToMany(place => Place, place => place.type)
    places: Place[];
}
