import {Column, Entity, JoinColumn, ManyToOne, OneToMany} from "typeorm";
import {TradingPointType} from "./trading-point-type.entity";
import {Transaction} from "./transaction.entity";
import {PartnerPayment} from "./partner-payment.entity";
import {Terminal} from "./terminal.entity";
import {Phone} from "./phone.entity";
import {TadeusEntity} from "./base.entity";
import {Address} from "./address.entity";
import {ColumnNumericTransformer} from "../../common/util/number-column.transformer";
import {Opinion} from "./opinion.entity";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'PARTNER'})
export class TradingPoint extends TadeusEntity {
    @Column({name: 'ID'})
    ID: string;

    @Column({name: 'NAME'})
    name: string;

    @Column({name: 'DONATION_PERCENTAGE', type: "decimal", transformer: new ColumnNumericTransformer()})
    donationPercentage: number = 2;

    @Column({name: 'VAT', type: "decimal", transformer: new ColumnNumericTransformer()})
    vat: number = 23;

    @Column({name: 'FEE', type: "decimal", transformer: new ColumnNumericTransformer()})
    fee: number = 0.66;

    @Column({name: 'DEFAULT_PRICE', type: "decimal", transformer: new ColumnNumericTransformer(), default: 0})
    price: number = 0;

    @Column({name: 'EMAIL'})
    email: string;

    @Column({name: 'IMAGE', nullable: true})
    image: string = 'icon.jpg';

    @Column({name: 'XP', transformer: new ColumnNumericTransformer()})
    xp: number = 0;

    @Column({name: 'ACTIVE', default: false})
    active: boolean = false;

    @Column({name: 'CLOSED_AT', nullable: true})
    closedAt?: Date;

    @ManyToOne(type => TradingPointType)
    @JoinColumn({name: 'PARTNER_TYPE_SKID'})
    type: TradingPointType;

    @ManyToOne(type => Phone)
    @JoinColumn({name: 'PHONE_SKID'})
    phone: Phone;

    @ManyToOne(type => Address)
    @JoinColumn({name: 'ADDRESS_SKID'})
    address: Address;

    @OneToMany(type => Terminal, terminal => terminal.tradingPoint)
    terminals?: Terminal[];

    @OneToMany(type => PartnerPayment, payment => payment.tradingPoint)
    payments?: PartnerPayment[];

    @OneToMany(type => Transaction, transactions => transactions.tradingPoint)
    transactions?: Transaction[];

    @OneToMany(type => Opinion, opinion => opinion.tradingPoint)
    opinions?: Opinion[];

    constructor(ID: string,
                name: string,
                email: string,
                phone: Phone,
                type: TradingPointType,
                address: Address) {
        super();
        this.ID = ID;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.type = type;
        this.address = address;
    }

    static findActivePointWithCityById(tradingPointId?: string) {
        return this.createQueryBuilder('point')
            .leftJoinAndSelect('point.address', 'address')
            .leftJoinAndSelect('address.city', 'city')
            .where('point.id = :id', {id: tradingPointId})
            .andWhere('point.active = true')
            .getOne();
    }
}
