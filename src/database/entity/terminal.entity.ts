import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Step } from "../../common/enum/status.enum";
import { TradingPoint } from "./trading-point.entity";
import { Transaction } from "./transaction.entity";
import { User } from "./user.entity";
import { Phone } from "./phone.entity";
import { TadeusEntity } from "./base.entity";

@Entity({schema: 'tds'})
export class Terminal extends TadeusEntity {
    @Column({type: 'text', nullable: true})
    step: Step = Step.SIGN_IN;

    @Column()
    ID: string;

    @Column({default: false})
    isMain: boolean = false;

    @ManyToOne(type => Phone)
    @JoinColumn()
    phone: Phone;

    @ManyToOne(type => TradingPoint)
    @JoinColumn()
    tradingPoint: TradingPoint;

    @OneToMany(type => Transaction, transactions => transactions.user)
    transactions?: Transaction[];

    @OneToMany(type => User, user => user.terminal)
    user?: User[];

    constructor(ID: string, phone: Phone, point: TradingPoint) {
        super();
        this.ID = ID;
        this.phone = phone;
        this.tradingPoint = point;
    }
}
