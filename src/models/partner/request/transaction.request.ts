import { ApiModelProperty } from "@nestjs/swagger";

export class TransactionRequest {
    @ApiModelProperty()
    price: number;

    @ApiModelProperty()
    clientCode: string;

    @ApiModelProperty()
    phonePrefix: number;

    @ApiModelProperty()
    phone: number;

    constructor(price: number, code: string, prefix: number, phone: number) {
        this.price = price;
        this.clientCode = code;
        this.phone = phone;
        this.phonePrefix = prefix;
    }
}

export class CorrectionRequest {
    @ApiModelProperty()
    transactionId: string;
    @ApiModelProperty()
    price: number;

    constructor(id: string, price: number) {
        this.transactionId = id;
        this.price = price;
    }
}
