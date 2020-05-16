import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {NgoType} from "./ngo-type.entity";
import {Donation} from "./donation.entity";
import {PhysicalCard} from "./physical-card.entity";
import {Phone} from "./phone.entity";
import {TadeusEntity} from "./base.entity";
import {Address} from "./address.entity";
import {ColumnNumericTransformer} from "../common/util/number-column.transformer";
import {User} from "./user.entity";
import {Transaction} from "./transaction.entity";

@Entity({name: 'NGO'})
export class Ngo extends TadeusEntity {

    @Column({name: 'ID'})
    ID: string;

    @Column({name: 'BANK_ACCOUNT', type: "bigint", transformer: new ColumnNumericTransformer()})
    bankNumber: number;

    @Column({name: 'EMAIL'})
    email: string;

    @Column({name: 'VERIFIED'})
    verified: boolean = false;

    @Column({nullable: true, name: 'VERIFIED_AT'})
    verifiedAt?: Date;

    @Column({name: 'NAME'})
    name: string;

    @Column({name: 'LONG_NAME'})
    longName: string;

    @Column({length: 550, name: 'DESCRIPTION'})
    description: string;

    @Column({nullable: true, name: 'IMAGE'})
    image: string = 'icon.jpg';

    @Column({nullable: true, name: 'THUMBNAIL'})
    thumbnail: string = 'thumbnail.jpg';

    @Column({name: 'IS_TADEUS'})
    isTadeus: boolean = false;

    @Column({name: 'TOTAL_DONATION', nullable: true, transformer: new ColumnNumericTransformer()})
    totalDonation?: number;

    @Column({name: 'LAST_DONATION', nullable: true, transformer: new ColumnNumericTransformer()})
    lastDonation?: number;

    @ManyToOne(type => Phone)
    @JoinColumn({name: 'PHONE_SKID'})
    phone: Phone;

    @OneToOne(type => PhysicalCard)
    @JoinColumn({name: 'PHYSICAL_CARD_SKID'})
    card: PhysicalCard;

    @ManyToOne(type => Address)
    @JoinColumn({name: 'ADDRESS_SKID'})
    address: Address;

    @ManyToOne(type => NgoType)
    @JoinColumn({name: 'NGO_TYPE_SKID'})
    type: NgoType;

    @OneToMany(type => User, user => user.ngo)
    users?: User[];

    @OneToMany(type => Donation, donation => donation.ngo)
    donations?: Donation[];

    @OneToMany(type => Transaction, transaction => transaction.ngo)
    transactions?: Transaction[];

    constructor(ID: string,
                email: string,
                bankNumber: number,
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
