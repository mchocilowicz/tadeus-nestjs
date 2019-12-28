import { ApiModelProperty } from "@nestjs/swagger";

export class PartnerTransactionResponse {
    @ApiModelProperty()
    id: string;
    @ApiModelProperty()
    price: number;
    @ApiModelProperty()
    date: Date;

    constructor(id: string, price: number, date: Date) {
        this.id = id;
        this.price = price;
        this.date = date;
    }
}