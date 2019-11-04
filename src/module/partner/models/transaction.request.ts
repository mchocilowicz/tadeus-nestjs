import {ApiModelProperty} from "@nestjs/swagger";

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
