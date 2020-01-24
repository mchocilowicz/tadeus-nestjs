import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from "typeorm";
import { PhonePrefix } from "./phone-prefix.entity";
import { TradingPoint } from "./trading-point.entity";
import { User } from "./user.entity";
import { Terminal } from "./terminal.entity";
import { Ngo } from "./ngo.entity";
import { TadeusEntity } from "./base.entity";
import { ColumnNumericTransformer } from "../../common/util/number-column.transformer";
import { Admin } from "./admin.entity";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'PHONE'})
@Unique(['value'])
export class Phone extends TadeusEntity {
    @Column({unique: true, transformer: new ColumnNumericTransformer()})
    value: number;

    @ManyToOne(type => PhonePrefix, prefix => prefix.phone)
    @JoinColumn({name: 'PHONE_PREFIX_SKID'})
    prefix: PhonePrefix;

    @OneToMany(type => TradingPoint, point => point.phone)
    tradingPoint?: TradingPoint[];

    @OneToMany(type => User, user => user.phone)
    user?: User[];

    @OneToMany(type => Terminal, terminal => terminal.phone)
    terminal?: Terminal[];

    @OneToMany(type => Admin, admin => admin.phone)
    admin?: Admin[];

    @OneToMany(type => Ngo, ngo => ngo.phone)
    ngo?: Ngo[];

    constructor(phoneNumber: number, phonePrefix: PhonePrefix) {
        super();
        this.value = phoneNumber;
        this.prefix = phonePrefix
    }

    static findNumber(prefix: number, number: number) {
        return this.createQueryBuilder('phone')
            .leftJoin('phone.prefix', 'prefix')
            .where('phone.value = :number AND prefix.value = :prefix', {number: number, prefix: prefix})
            .getOne();
    }

    static findClientNumber(prefix: number, number: number) {
        return this.createQueryBuilder('phone')
            .leftJoin('phone.prefix', 'prefix')
            .leftJoin('phone.user', 'user')
            .where('phone.value = :number AND prefix.value = :prefix', {number: number, prefix: prefix})
            .getOne();
    }
}
