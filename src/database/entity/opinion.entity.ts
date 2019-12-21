import { Column, Entity, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { TadeusEntity } from "./base.entity";
import { TradingPoint } from "./trading-point.entity";

@Entity({schema: 'tds'})
export class Opinion extends TadeusEntity {
    @Column()
    value: string;

    @Column()
    email: string;

    @ManyToOne(type => User, user => user.opinions)
    user?: User;

    @ManyToOne(type => TradingPoint, point => point.opinions)
    tradingPoint?: TradingPoint;

    constructor(email: string, value: string, user?: User, tradingPoint?: TradingPoint) {
        super();
        this.email = email;
        this.value = value;
        this.user = user;
        this.tradingPoint = tradingPoint;
    }
}
