import { ApiModelProperty } from "@nestjs/swagger";
import { Length } from "class-validator";

export class RegisterPhoneDto {
    @ApiModelProperty({description: 'Phone number', required: true})
    @Length(9, 12, {message: 'Proszę podać prawidłowy numer telefonu.'})
    phone: string;
    @ApiModelProperty({description: 'Key obtained while creating Anonymous User'})
    anonymousKey: string;
}
