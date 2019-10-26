import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { TradingPoint } from "./trading-point.entity";
import { User } from "./user.entity";
import { Cart } from "./cart.entity";
import { Terminal } from "./terminal.entity";
import { TadeusEntity } from "./base.entity";

@Entity({schema: 'tds'})
export class Transaction extends TadeusEntity {
    @Column()
    ID: string;

    @Column({type: 'decimal'})
    price: number;

    @Column({type: 'decimal'})
    donationPercentage: number = 0;

    @Column({type: 'decimal'})
    donationValue: number = 0;

    @Column()
    userXp: number = 0;

    @Column()
    tradingPointXp: number = 0;

    @Column()
    isCorrection: boolean = false;

    @Column()
    verifiedByUser: boolean = false;

    @ManyToOne(type => Cart, cart => cart.transactions)
    @JoinColumn()
    cart: Cart;

    @ManyToOne(type => TradingPoint, tradingPoint => tradingPoint.transactions)
    tradingPoint: TradingPoint;

    @ManyToOne(type => User, user => user.transactions)
    user: User;

    @ManyToOne(type => Terminal, terminal => terminal.transactions)
    terminal: Terminal;

    constructor(terminal: Terminal,
                user: User,
                tradingPoint: TradingPoint,
                cart: Cart,
                ID: string,
                price: number) {
        super();
        this.terminal = terminal;
        this.user = user;
        this.tradingPoint = tradingPoint;
        this.cart = cart;
        this.ID = ID;
        this.price = price;
    }
}
