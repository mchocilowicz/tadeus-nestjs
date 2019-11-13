import {ApiModelProperty} from "@nestjs/swagger";
import {VirtualCard} from "../../../database/entity/virtual-card.entity";

export class VirtualCardResponse {
    @ApiModelProperty()
    code?: string;
    @ApiModelProperty()
    cardNumber: string;

    constructor(card: VirtualCard) {
        this.code = card.code;
        this.cardNumber = card.ID;
    }
}
