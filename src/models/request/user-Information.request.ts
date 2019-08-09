import { ApiModelProperty } from "@nestjs/swagger";
import { IsAlpha, IsEmail, IsNotEmpty, IsPhoneNumber, NotContains } from "class-validator";

export class UserInformationRequest {
    @ApiModelProperty({description: 'Phone number', required: true})
    @IsNotEmpty({
        message: "phone_required"
    })
    @IsPhoneNumber('PL', {message: 'phone_format'})
    @NotContains("-", {message: 'phone_dash_format'})
    phone: string;

    @IsNotEmpty({
        message: "name_required"
    })
    @IsAlpha({
        message: "name_format"
    })
    @ApiModelProperty({required: true})
    name: string;

    @ApiModelProperty({required: true})
    @IsNotEmpty({
        message: "email_required"
    })
    @IsEmail({}, {
        message: "email_format"
    })
    email: string;
}
