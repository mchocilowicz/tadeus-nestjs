import {ApiModelProperty} from "@nestjs/swagger";

export class TransactionSuccessResponse {
    @ApiModelProperty()
    date: string;
    @ApiModelProperty()
    price: number;
    @ApiModelProperty()
    xp: number;

    constructor(date: string, price: number, xp: number) {
        this.date = date;
        this.price = price;
        this.xp = xp;
    }
}

export class CorrectionResponse {
    @ApiModelProperty()
    transactionId: string;
    @ApiModelProperty()
    price: number;

    constructor(id: string, price: number) {
        this.transactionId = id;
        this.price = price;
    }
}

export class CorrectionSuccessResponse {
    @ApiModelProperty()
    date: string;
    @ApiModelProperty()
    price: number;
    @ApiModelProperty()
    xp: number;

    constructor(date: string, price: number, xp: number) {
        this.date = date;
        this.price = price;
        this.xp = xp;
    }
}
