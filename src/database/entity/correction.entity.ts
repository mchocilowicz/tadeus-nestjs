import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { TadeusEntity } from "./base.entity";
import { Terminal } from "./terminal.entity";
import { Transaction } from "./transaction.entity";
import { User } from "./user.entity";
import { TradingPoint } from "./trading-point.entity";
import { ColumnNumericTransformer } from "../../common/util/number-column.transformer";

@Entity({schema: 'tds'})
export class Correction extends TadeusEntity {

    @Column()
    price: number;

    @Column({transformer: new ColumnNumericTransformer()})
    transactionPrice: number;

    @Column({transformer: new ColumnNumericTransformer()})
    transactionPool: number;

    @Column({transformer: new ColumnNumericTransformer()})
    pool: number;

    @Column()
    status: string;

    @Column()
    isVerified: boolean = false;

    @ManyToOne(type => Terminal)
    @JoinColumn()
    terminal: Terminal;

    @ManyToOne(type => TradingPoint)
    @JoinColumn()
    tradingPoint: TradingPoint;

    @OneToOne(type => Transaction)
    @JoinColumn()
    transaction: Transaction;

    @ManyToOne(type => User)
    @JoinColumn()
    user: User;

    constructor(price: number, status: string, terminal: Terminal, transaction: Transaction, user: User, point: TradingPoint, pool: number, transactionPool: number, transactionPrice: number) {
        super();
        this.price = price;
        this.status = status;
        this.terminal = terminal;
        this.transaction = transaction;
        this.user = user;
        this.tradingPoint = point;
        this.transactionPool = transactionPool;
        this.transactionPrice = transactionPrice;
        this.pool = pool;
    }
}
