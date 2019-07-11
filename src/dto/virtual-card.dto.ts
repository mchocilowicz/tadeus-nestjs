import { ApiModelProperty } from "@nestjs/swagger";

export class VirtualCardDto {
    @ApiModelProperty()
    qrCode: string;
    @ApiModelProperty()
    cardNumber: string;
}
