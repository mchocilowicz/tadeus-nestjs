import { ApiModelProperty } from "@nestjs/swagger";

export class TransactionRequest {
    @ApiModelProperty()
    price: number;
    @ApiModelProperty()
    clientCode: string;

    constructor(price: number, code: string) {
        this.price = price;
        this.clientCode = code;
    }

}
