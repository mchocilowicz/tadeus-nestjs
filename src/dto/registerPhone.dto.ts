import { ApiModelProperty } from "@nestjs/swagger";

export class RegisterPhoneDto {
    @ApiModelProperty({description: 'Phone number', required: true})
    phone: string;
    @ApiModelProperty({description: 'Key obtained while creating Anonymous Use'})
    anonymousKey: string;
}
