import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn
} from "typeorm";
import { User } from "./user.entity";
import { PlaceType } from "./place-type.entity";
import { City } from "./city.entity";

@Entity()
@Unique(["name"])
export class Place extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(type => User, user => user.places)
    user: User;

    @ManyToOne(type => PlaceType)
    @JoinColumn()
    type: PlaceType;

    @Column()
    name: string;

    @ManyToOne(type => City)
    @JoinColumn()
    city: City;

    @Column()
    location: string;

    @Column()
    address: string;

    @Column()
    postCode: string;

    @Column()
    percentage: number;

    @CreateDateColumn()
    createdDate: Date;

    @UpdateDateColumn()
    updatedDate: Date;
}
