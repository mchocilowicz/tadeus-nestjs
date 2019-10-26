import { ApiModelProperty } from "@nestjs/swagger";
import { TradingPoint } from "../../database/entity/trading-point.entity";

export class PartnerDetailsResponse {
    @ApiModelProperty()
    id: string;
    @ApiModelProperty()
    name: string;
    @ApiModelProperty()
    city: string;
    @ApiModelProperty()
    address: string;
    @ApiModelProperty()
    postCode: string;
    @ApiModelProperty()
    xp: number;

    constructor(userID: string, tradingPoint: TradingPoint) {
        this.id = userID;
        this.name = tradingPoint.name;
        this.city = tradingPoint.city.name;
        this.address = tradingPoint.address;
        this.postCode = tradingPoint.postCode;
        this.xp = Number(tradingPoint.xp)
    }
}
