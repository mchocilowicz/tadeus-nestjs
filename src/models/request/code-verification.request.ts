import { ApiModelProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsPhoneNumber, MaxLength, NotContains } from "class-validator";

export class CodeVerificationRequest {
    @ApiModelProperty({description: 'Phone number', required: true})
    @IsNotEmpty({
        message: "phone_required"
    })
    @IsPhoneNumber('PL', {message: 'phone_format'})
    @NotContains("-", {message: 'phone_dash_format'})
    readonly phone: string;

    @ApiModelProperty({required: true})
    @IsNumberString({message: 'code_format'})
    @MaxLength(4, {message: 'code_max_value'})
    readonly code: number;
}
