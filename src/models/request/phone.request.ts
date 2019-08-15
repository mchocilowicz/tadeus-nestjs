import { ApiModelProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber, NotContains } from "class-validator";

export class PhoneRequest {
    @ApiModelProperty({description: 'Phone number', required: true})
    @ApiModelProperty()
    @IsNotEmpty({
        message: "phone_required"
    })
    @IsPhoneNumber('PL', {message: 'phone_format'})
    @NotContains("-", {message: 'phone_format'})
    @NotContains(" ", {message: 'phone_format'})
    phone: string
}
