import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, Unique } from "typeorm";
import { NgoType } from "./ngo-type.entity";
import { City } from "./city.entity";
import { Donation } from "./donation.entity";
import { UserDetails } from "./user-details.entity";
import { PhysicalCard } from "./physical-card.entity";
import { Phone } from "./phone.entity";
import { TadeusEntity } from "./base.entity";

@Entity({schema: 'tds'})
@Unique(["name"])
export class Ngo extends TadeusEntity {

    @Column()
    ID: string;

    @Column()
    bankNumber: string;

    @Column()
    email: string;

    @Column()
    verified: boolean = false;

    @Column({nullable: true})
    verifiedAt?: Date;

    @Column({type: "decimal"})
    longitude: number;

    @Column({type: "decimal"})
    latitude: number;

    @Column({nullable: true})
    distance?: number;

    @Column("geometry", {
        nullable: true,
        spatialFeatureType: "Point",
        srid: 4326
    })
    coordinate?: object;

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
    totalDonation?: number;

    @Column({nullable: true})
    lastDonation?: number;

    @ManyToOne(type => Phone)
    @JoinColumn()
    phone?: Phone;

    @OneToOne(type => PhysicalCard)
    @JoinColumn()
    card?: PhysicalCard;

    @ManyToOne(type => City)
    @JoinColumn()
    city: City;

    @ManyToOne(type => NgoType)
    @JoinColumn()
    type: NgoType;

    @OneToMany(type => UserDetails, user => user.ngo)
    userDetails?: UserDetails[];

    @OneToMany(type => Donation, donation => donation.ngo)
    donations?: Donation[];

    constructor(ID: string,
                email: string,
                bankNumber: string,
                name: string,
                longName: string,
                description: string,
                longitude: number,
                latitude: number,
                address: string,
                postCode: string,
                city: City,
                type: NgoType) {
        super();
        this.ID = ID;
        this.email = email;
        this.bankNumber = bankNumber;
        this.name = name;
        this.longName = longName;
        this.description = description;
        this.longitude = Number(longitude);
        this.latitude = Number(latitude);
        this.address = address;
        this.postCode = postCode;
        this.city = city;
        this.type = type;
    }

    @BeforeInsert()
    assignPointData() {
        this.coordinate = {
            type: "Point",
            coordinates: [this.longitude, this.latitude]
        };
    }

}
