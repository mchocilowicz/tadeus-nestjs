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
    Unique,
    UpdateDateColumn
} from "typeorm";
import { NgoType } from "./ngo-type.entity";
import { City } from "./city.entity";
import { Donation } from "./donation.entity";
import { UserDetails } from "./user-details.entity";
import { PhysicalCard } from "./physical-card.entity";

@Entity({schema: 'tds'})
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
    phonePrefix: string;

    @Column()
    email: string;

    @Column()
    verified: boolean = false;

    @Column({nullable: true})
    verifiedAt: Date;

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
    longName: string;

    @Column({length: 550})
    description: string;

    @Column({nullable: true})
    image: string = 'icon.jpg';

    @Column({nullable: true})
    thumbnail: string = 'thumbnail.jpg';

    @Column()
    isTadeus: boolean = false;

    @Column()
    address: string;

    @Column()
    postCode: string;

    @Column({nullable: true})
    totalDonation: number = 0;

    @Column({nullable: true})
    lastDonation: number = 0;

    @OneToOne(type => PhysicalCard)
    @JoinColumn()
    card: PhysicalCard;

    @ManyToOne(type => City, {nullable: false})
    @JoinColumn()
    city: City;

    @ManyToOne(type => NgoType, {nullable: false})
    @JoinColumn()
    type: NgoType;

    @OneToMany(type => UserDetails, user => user.ngo)
    userDetails: UserDetails[];

    @OneToMany(type => Donation, donation => donation.ngo)
    donations: Donation[];

    @CreateDateColumn()
    creationAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    assignPointData() {
        this.coordinate = {
            type: "Point",
            coordinates: [this.longitude, this.latitude]
        };
    }
}
