import {
    BaseEntity,
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    Unique
} from "typeorm";
import { NgoType } from "./ngo-type.entity";
import { City } from "./city.entity";
import { User } from "./user.entity";
import { Donation } from "./donation.entity";
import { Card } from "./card.entity";

@Entity()
@Unique(["name"])
export class Ngo extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    ID: string;

    @Column()
    bankNumber: string;

    @Column()
    phone: string;

    @Column()
    email: string;

    @Column()
    verified: boolean = false;

    @Column({nullable: true})
    verificationDate: Date;

    @Column({type: "decimal"})
    longitude: number;

    @Column({type: "decimal"})
    latitude: number;

    @Column({nullable: true})
    distance: number;

    @Column("geometry", {
        nullable: true,
        spatialFeatureType: "Point",
        srid: 4326
    })
    coordinate: object;

    @Column()
    name: string;

    @Column()
    address: string;

    @Column()
    postCode: string;

    @Column({nullable: true})
    totalDonation: number = 0;

    @Column({nullable: true})
    lastDonation: number = 0;

    @OneToOne(type => Card)
    @JoinColumn()
    card: Card;

    @ManyToOne(type => City, {nullable: false})
    @JoinColumn()
    city: City;

    @ManyToOne(type => NgoType, {nullable: false})
    @JoinColumn()
    type: NgoType;

    @OneToMany(type => User, user => user.ngo)
    user: User[];

    @OneToMany(type => Donation, donation => donation.ngo)
    donations: Donation[];

    @CreateDateColumn()
    creationDate: Date;

    @BeforeInsert()
    assignPointData() {
        this.coordinate = {
            type: "Point",
            coordinates: [this.longitude, this.latitude]
        };
    }
}
