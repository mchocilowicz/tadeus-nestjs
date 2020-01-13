import { ApiProperty } from "@nestjs/swagger";
import { VirtualCard } from "../../../database/entity/virtual-card.entity";

export class VirtualCardResponse {
    @ApiProperty()
    code?: string;
    @ApiProperty()
    cardNumber: string;

    constructor(card: VirtualCard) {
        this.code = card.code;
        this.cardNumber = card.ID;
    }
}
