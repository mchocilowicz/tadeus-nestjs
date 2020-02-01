import {ApiProperty} from "@nestjs/swagger";

export class PartnerVerifyResponse {
    @ApiProperty()
    name: string;
    @ApiProperty()
    card: string;

    constructor(card?: string, name?: string) {
        this.name = name ? name : '';
        this.card = card ? card : '';
    }

}
