import { ApiModelProperty } from "@nestjs/swagger";

export class RegisterPhoneDto {
    @ApiModelProperty()
    phone: string;
    @ApiModelProperty({description: 'Key obtained while creating Anonymous Use'})
    anonymousKey: string;
}
