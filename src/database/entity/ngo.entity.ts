import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {NgoType} from "./ngo-type.entity";
import {Donation} from "./donation.entity";
import {PhysicalCard} from "./physical-card.entity";
import {Phone} from "./phone.entity";
import {TadeusEntity} from "./base.entity";
import {Address} from "./address.entity";
import {ColumnNumericTransformer} from "../../common/util/number-column.transformer";
import {User} from "./user.entity";

@Entity({schema: 'tds'})
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

    @Column({nullable: true, transformer: new ColumnNumericTransformer()})
    totalDonation?: number;

    @Column({nullable: true, transformer: new ColumnNumericTransformer()})
    lastDonation?: number;

    @ManyToOne(type => Phone)
    @JoinColumn()
    phone: Phone;

    @OneToOne(type => PhysicalCard)
    @JoinColumn()
    card: PhysicalCard;

    @ManyToOne(type => Address)
    @JoinColumn()
    address: Address;

    @ManyToOne(type => NgoType)
    @JoinColumn()
    type: NgoType;

    @OneToMany(type => User, user => user.ngo)
    user?: User[];

    @OneToMany(type => Donation, donation => donation.ngo)
    donations?: Donation[];

    constructor(ID: string,
                email: string,
                bankNumber: string,
                name: string,
                longName: string,
                description: string,
                address: Address,
                type: NgoType,
                phone: Phone,
                card: PhysicalCard) {
        super();
        this.ID = ID;
        this.email = email;
        this.bankNumber = bankNumber;
        this.name = name;
        this.longName = longName;
        this.description = description;
        this.type = type;
        this.phone = phone;
        this.card = card;
        this.address = address;
    }

}
