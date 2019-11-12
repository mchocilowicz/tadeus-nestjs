import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {Status, Step} from "../../common/enum/status.enum";
import {TradingPoint} from "./trading-point.entity";
import {Transaction} from "./transaction.entity";
import {Phone} from "./phone.entity";
import {TadeusEntity} from "./base.entity";
import {Correction} from "./correction.entity";
import {Account} from "./account.entity";

@Entity({schema: 'tds'})
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

    @OneToMany(type => Correction, correction => correction.terminal)
    corrections?: Correction[];

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

    static findAllWithoutCurrentTerminal(terminalId: string) {
        return this.createQueryBuilder('terminal')
            .leftJoinAndSelect('terminal.tradingPoint', 'tradingPoint')
            .leftJoin('terminal.accounts', 'account')
            .where('account.status = :status', {status: Status.ACTIVE})
            .andWhere('terminal.id != :id', {id: terminalId})
            .getMany();
    }
}
