import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {Status, Step} from "../../common/enum/status.enum";
import {TradingPoint} from "./trading-point.entity";
import {Transaction} from "./transaction.entity";
import {Phone} from "./phone.entity";
import {TadeusEntity} from "./base.entity";
import {Account} from "./account.entity";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'TERMINAL'})
export class Terminal extends TadeusEntity {
    @Column({type: 'text', nullable: true})
    step: Step = Step.SIGN_IN;

    @Column()
    ID: string;

    @Column({default: false})
    isMain: boolean = false;

    @Column({nullable: true})
    name?: string;

    @ManyToOne(type => Phone)
    @JoinColumn()
    phone?: Phone;

    @ManyToOne(type => TradingPoint)
    @JoinColumn()
    tradingPoint: TradingPoint;

    @OneToMany(type => Transaction, transactions => transactions.terminal)
    transactions?: Transaction[];

    @OneToOne(type => Account)
    @JoinColumn()
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
