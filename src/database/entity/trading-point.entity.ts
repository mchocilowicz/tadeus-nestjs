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

@Entity({schema: 'tds'})
export class TradingPoint extends TadeusEntity {
    @Column()
    ID: string;

    @Column()
    name: string;

    @Column({type: "decimal", transformer: new ColumnNumericTransformer()})
    donationPercentage: number = 2;

    @Column({type: "decimal", transformer: new ColumnNumericTransformer()})
    vat: number = 23;

    @Column({type: "decimal", transformer: new ColumnNumericTransformer()})
    fee: number = 0.66;

    @Column({type: "decimal", transformer: new ColumnNumericTransformer(), default: 0})
    price: number = 0;

    @Column()
    email: string;

    @Column({nullable: true})
    image: string = 'icon.jpg';

    @Column({transformer: new ColumnNumericTransformer()})
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

    @OneToMany(type => Transaction, transactions => transactions.tradingPoint)
    transactions?: Transaction[];

    @OneToMany(type => Opinion, opinion => opinion.tradingPoint)
    opinions?: Opinion[];

    constructor(ID: string,
                name: string,
                longitude: number,
                latitude: number,
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
