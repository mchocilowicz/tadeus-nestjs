import { ApiProperty } from "@nestjs/swagger";

export class PartnerTransactionResponse {
    @ApiProperty()
    id: string;
    @ApiProperty()
    price: number;
    @ApiProperty()
    date: Date;

    constructor(id: string, price: number, date: Date) {
        this.id = id;
        this.price = price;
        this.date = date;
    }
}