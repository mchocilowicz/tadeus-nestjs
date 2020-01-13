import { ApiProperty } from "@nestjs/swagger";
import { TradingPoint } from "../../../database/entity/trading-point.entity";
import { PartnerPayment } from "../../../database/entity/partner-payment.entity";

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
    code: string;
    @ApiProperty()
    totalDonation: number = 0;
    @ApiProperty()
    donationDeadline?: Date;

    constructor(userID: string, tradingPoint: TradingPoint, code: string, to: Date, payment?: PartnerPayment) {
        this.id = userID;
        this.name = tradingPoint.name;
        this.city = tradingPoint.address.city.name;
        this.street = tradingPoint.address.street;
        this.number = tradingPoint.address.number;
        this.postCode = tradingPoint.address.postCode;
        this.xp = Number(tradingPoint.xp);
        this.code = code;
        if (payment) {
            this.totalDonation = payment.price;
        }
        this.donationDeadline = to;
    }
}
