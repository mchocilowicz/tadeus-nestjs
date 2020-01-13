import { ApiProperty } from "@nestjs/swagger";

export class PartnerVerifyQuery {
    @ApiProperty()
    card: string;
    @ApiProperty()
    prefix: number;
    @ApiProperty()
    phone: number;

    constructor(card: string, prefix: number, phone: number) {
        this.card = card;
        this.prefix = prefix;
        this.phone = phone;
    }
}
