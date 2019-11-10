import {Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique} from "typeorm";
import {TradingPointType} from "./trading-point-type.entity";
import {Transaction} from "./transaction.entity";
import {PartnerPayment} from "./partner-payment.entity";
import {Terminal} from "./terminal.entity";
import {Phone} from "./phone.entity";
import {TadeusEntity} from "./base.entity";
import {Correction} from "./correction.entity";
import {Address} from "./address.entity";

@Entity({schema: 'tds'})
@Unique(["name"])
export class TradingPoint extends TadeusEntity {
    @Column()
    ID: string;

    @Column()
    name: string;

    @Column({type: "decimal"})
    donationPercentage: number = 2;

    @Column({type: "decimal"})
    vat: number = 23;

    @Column({type: "decimal"})
    fee: number = 0.66;

    @Column({nullable: true})
    image: string = 'icon.jpg';

    @Column()
    xp: number = 0;

    @Column({default: false})
    active: boolean = false;

    @Column({nullable: true})
    closedAt?: Date;

    @ManyToOne(type => TradingPointType)
    @JoinColumn()
    type: TradingPointType;

    @ManyToOne(type => Phone)
    @JoinColumn()
    phone: Phone;

    @ManyToOne(type => Address)
    @JoinColumn()
    address: Address;

    @OneToMany(type => Terminal, terminal => terminal.tradingPoint)
    terminals?: Terminal[];

    @OneToMany(type => PartnerPayment, payment => payment.tradingPoint)
    payments?: PartnerPayment[];

    @OneToMany(type => Correction, correction => correction.tradingPoint)
    corrections?: Correction[];

    @OneToMany(type => Transaction, transactions => transactions.tradingPoint)
    transactions?: Transaction[];

    constructor(ID: string,
                name: string,
                longitude: number,
                latitude: number,
                phone: Phone,
                type: TradingPointType,
                address: Address) {
        super();
        this.ID = ID;
        this.name = name;
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
