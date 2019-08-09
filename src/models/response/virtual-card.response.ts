import { ApiModelProperty } from "@nestjs/swagger";

export class VirtualCardResponse {
    @ApiModelProperty()
    code: string;
    @ApiModelProperty()
    cardNumber: string;
}
