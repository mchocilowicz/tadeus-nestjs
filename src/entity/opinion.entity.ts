import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {User} from "./user.entity";
import {TadeusEntity} from "./base.entity";
import {TradingPoint} from "./trading-point.entity";

@Entity({name: 'OPINION'})
export class Opinion extends TadeusEntity {
    @Column({name: 'VALUE'})
    value: string;

    @Column({name: 'EMAIL', nullable: true})
    email?: string;

    @ManyToOne(type => User, user => user.opinions)
    @JoinColumn({name: 'USER_SKID'})
    user?: User;

    @ManyToOne(type => TradingPoint, point => point.opinions)
    @JoinColumn({name: 'PARTNER_SKID'})
    tradingPoint?: TradingPoint;

    constructor(value: string, email?: string, user?: User, tradingPoint?: TradingPoint) {
        super();
        this.email = email;
        this.value = value;
        this.user = user;
        this.tradingPoint = tradingPoint;
    }
}
