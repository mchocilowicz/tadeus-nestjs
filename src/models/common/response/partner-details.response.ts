import { ApiModelProperty } from "@nestjs/swagger";
import { TradingPoint } from "../../../database/entity/trading-point.entity";

export class PartnerDetailsResponse {
    @ApiModelProperty()
    id: string;
    @ApiModelProperty()
    name: string;
    @ApiModelProperty()
    city: string;
    @ApiModelProperty()
    street: string;
    @ApiModelProperty()
    number: number;
    @ApiModelProperty()
    postCode: string;
    @ApiModelProperty()
    xp: number;

    constructor(userID: string, tradingPoint: TradingPoint) {
        this.id = userID;
        this.name = tradingPoint.name;
        this.city = tradingPoint.address.city.name;
        this.street = tradingPoint.address.street;
        this.number = tradingPoint.address.number;
        this.postCode = tradingPoint.address.postCode;
        this.xp = Number(tradingPoint.xp)
    }
}
