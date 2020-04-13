import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {Status, Step} from "../common/enum/status.enum";
import {TradingPoint} from "./trading-point.entity";
import {Transaction} from "./transaction.entity";
import {Phone} from "./phone.entity";
import {TadeusEntity} from "./base.entity";
import {Account} from "./account.entity";

@Entity({name: 'TERMINAL'})
export class Terminal extends TadeusEntity {
    @Column({name: 'STATUS', type: 'text', nullable: true})
    step: Step = Step.SIGN_IN;

    @Column({name: 'ID'})
    ID: string;

    @Column({name: 'IS_MAIN', default: false})
    isMain: boolean = false;

    @Column({name: 'NAME', nullable: true})
    name?: string;

    @ManyToOne(type => Phone)
    @JoinColumn({name: 'PHONE_SKID'})
    phone?: Phone;

    @ManyToOne(type => TradingPoint)
    @JoinColumn({name: 'PARTNER_SKID'})
    tradingPoint: TradingPoint;

    @OneToMany(type => Transaction, transactions => transactions.terminal)
    transactions?: Transaction[];

    @OneToOne(type => Account)
    @JoinColumn({name: 'ACCOUNT_SKID'})
    account: Account;

    constructor(ID: string, phone: Phone, point: TradingPoint, account: Account, name?: string) {
        super();
        this.ID = ID;
        this.phone = phone;
        this.tradingPoint = point;
        this.account = account;
        this.name = name;
    }

    static findAllTerminals(pointId: string) {
        return this.createQueryBuilder('terminal')
            .leftJoinAndSelect('terminal.tradingPoint', 'tradingPoint')
            .leftJoinAndSelect('terminal.phone', 'phone')
            .leftJoinAndSelect('phone.prefix', 'prefix')
            .leftJoin('terminal.account', 'account')
            .where('account.status = :status', {status: Status.ACTIVE})
            .andWhere('tradingPoint.id = :id', {id: pointId})
            .getMany();
    }
}
