import { ApiModelProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPhoneNumber, Max, NotContains } from "class-validator";

export class CodeVerificationRequest {
    @ApiModelProperty({description: 'Phone number', required: true})
    @ApiModelProperty()
    @IsNotEmpty({
        message: "phone_required"
    })
    @IsPhoneNumber('PL', {message: 'phone_format'})
    @NotContains("-", {message: 'phone_dash_format'})
    readonly phone: string;

    @ApiModelProperty({required: true})
    @IsNumber({}, {message: 'code_format'})
    @Max(9999, {message: 'code_max_value'})
    readonly code: number;
}
