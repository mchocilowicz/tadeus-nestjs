import {ApiProperty} from "@nestjs/swagger";

export class TransactionRequest {
    @ApiProperty()
    price: number;

    @ApiProperty()
    clientCode: string;

    @ApiProperty()
    phonePrefix: number;

    @ApiProperty()
    phone: number;

    constructor(price: number, code: string, prefix: number, phone: number) {
        this.price = price;
        this.clientCode = code;
        this.phone = phone;
        this.phonePrefix = prefix;
    }
}

export class CorrectionRequest {
    @ApiProperty()
    transactionId: string;
    @ApiProperty()
    price: number;

    constructor(id: string, price: number) {
        this.transactionId = id;
        this.price = price;
    }
}
