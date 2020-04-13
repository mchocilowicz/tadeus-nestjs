import {ApiProperty} from "@nestjs/swagger";
import {TradingPoint} from "../../../entity/trading-point.entity";

export class PartnerDetailsResponse {
    @ApiProperty()
    id: string;
    @ApiProperty()
    name: string;
    @ApiProperty()
    city: string;
    @ApiProperty()
    street: string;
    @ApiProperty()
    number: number;
    @ApiProperty()
    postCode: string;
    @ApiProperty()
    xp: number;
    @ApiProperty()
    hasPayments: boolean = false;
    @ApiProperty()
    price: number;
    @ApiProperty()
    paymentAt?: Date;

    constructor(userID: string, tradingPoint: TradingPoint, hasPayments: boolean, paymentPrice: number, paymentAt?: Date) {
        this.id = userID;
        this.name = tradingPoint.name;
        this.city = tradingPoint.address.city.name;
        this.street = tradingPoint.address.street;
        this.number = tradingPoint.address.number;
        this.postCode = tradingPoint.address.postCode;
        this.xp = Number(tradingPoint.xp);
        this.hasPayments = hasPayments;
        this.price = paymentPrice;
        this.paymentAt = paymentAt;
    }
}
