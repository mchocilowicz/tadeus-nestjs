import { Column, Entity, ManyToOne, OneToMany, Unique } from "typeorm";
import { PhonePrefix } from "./phone-prefix.entity";
import { TradingPoint } from "./trading-point.entity";
import { User } from "./user.entity";
import { Terminal } from "./terminal.entity";
import { Ngo } from "./ngo.entity";
import { TadeusEntity } from "./base.entity";

@Entity({schema: 'tds'})
@Unique(['value'])
export class Phone extends TadeusEntity {
    @Column({unique: true})
    value: string;

    @ManyToOne(type => PhonePrefix, prefix => prefix.phone)
    prefix: PhonePrefix;

    @OneToMany(type => TradingPoint, point => point.phone)
    tradingPoint?: TradingPoint[];

    @OneToMany(type => User, user => user.phone)
    user?: User[];

    @OneToMany(type => Terminal, terminal => terminal.phone)
    terminal?: Terminal[];

    @OneToMany(type => Ngo, ngo => ngo.phone)
    ngo?: Ngo[];

    constructor(phoneNumber: string, phonePrefix: PhonePrefix) {
        super();
        this.value = phoneNumber;
        this.prefix = phonePrefix
    }
}
