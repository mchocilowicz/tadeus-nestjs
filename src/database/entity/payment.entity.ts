import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Cart } from "./cart.entity";
import { TradingPoint } from "./trading-point.entity";
import { TadeusEntity } from "./base.entity";

@Entity({schema: 'tds'})
export class Payment extends TadeusEntity {
    @Column()
    ID: string;

    @Column()
    invoiceNumber: string;

    @ManyToOne(type => Cart, cart => cart.payments)
    @JoinColumn()
    cart?: Cart;

    @ManyToOne(type => TradingPoint)
    @JoinColumn()
    tradingPoint?: TradingPoint;

    constructor(ID: string, invoiceNumber: string) {
        super();
        this.ID = ID;
        this.invoiceNumber = invoiceNumber;
    }
}
