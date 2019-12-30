import {ApiModelProperty} from "@nestjs/swagger";

export class PartnerVerifyQuery {
    @ApiModelProperty()
    card: string;
    @ApiModelProperty()
    prefix: number;
    @ApiModelProperty()
    phone: number;

    constructor(card: string, prefix: number, phone: number) {
        this.card = card;
        this.prefix = prefix;
        this.phone = phone;
    }
}
