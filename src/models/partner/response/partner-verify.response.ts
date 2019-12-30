import {ApiModelProperty} from "@nestjs/swagger";

export class PartnerVerifyResponse {
    @ApiModelProperty()
    name: string;
    @ApiModelProperty()
    card: string;

    constructor(card?: string, name?: string) {
        this.name = name ? name : '';
        this.card = card ? card : '';
    }

}
