import { ApiProperty } from "@nestjs/swagger";

export class TransactionSuccessResponse {
    @ApiProperty()
    date: string;
    @ApiProperty()
    price: number;
    @ApiProperty()
    xp: number;

    constructor(date: string, price: number, xp: number) {
        this.date = date;
        this.price = price;
        this.xp = xp;
    }
}

export class CorrectionResponse {
    @ApiProperty()
    transactionId: string;
    @ApiProperty()
    price: number;

    constructor(id: string, price: number) {
        this.transactionId = id;
        this.price = price;
    }
}

export class CorrectionSuccessResponse {
    @ApiProperty()
    date: string;
    @ApiProperty()
    price: number;
    @ApiProperty()
    xp: number;

    constructor(date: string, price: number, xp: number) {
        this.date = date;
        this.price = price;
        this.xp = xp;
    }
}
