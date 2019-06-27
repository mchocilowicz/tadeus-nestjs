import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { City } from "./city.entity";
import { NgoType } from "./ngo-type.entity";

@Entity()
export class Ngo extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => City)
    @JoinColumn()
    city: City;

    @ManyToOne(type => NgoType)
    @JoinColumn()
    type: NgoType;

    @Column()
    location: string;

    @Column()
    name: string;

    @Column()
    address: string;

}
