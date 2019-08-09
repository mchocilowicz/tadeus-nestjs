import { ApiModelProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsPhoneNumber, NotContains } from "class-validator";

export class NewPhoneRequest {
    @ApiModelProperty({description: 'Phone number', required: true})
    @ApiModelProperty()
    @IsNotEmpty({
        message: "phone_required"
    })
    @IsPhoneNumber('PL', {message: 'phone_format'})
    @NotContains("-", {message: 'phone_dash_format'})
    phone: string;
    @IsOptional()
    @ApiModelProperty({description: 'Key obtained while creating Anonymous User'})
    anonymousKey: string;
}
