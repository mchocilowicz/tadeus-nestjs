import { ApiModelProperty } from "@nestjs/swagger";

export class RegisterPhoneDto {
    @ApiModelProperty()
    phone: string;
    @ApiModelProperty()
    anonymousKey: string;
}
