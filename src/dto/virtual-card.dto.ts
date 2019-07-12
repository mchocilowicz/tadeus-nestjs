import { ApiModelProperty } from "@nestjs/swagger";

export class VirtualCardDto {
    @ApiModelProperty()
    code: string;
    @ApiModelProperty()
    cardNumber: string;
}
