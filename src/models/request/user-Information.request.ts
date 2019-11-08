import {ApiModelProperty} from "@nestjs/swagger";
import {IsAlpha, IsEmail, IsNotEmpty} from "class-validator";
import {PhoneRequest} from "./phone.request";

export class UserInformationRequest extends PhoneRequest {
    @IsNotEmpty({
        message: "user_data_required"
    })
    @IsAlpha({
        message: "name_format"
    })
    @ApiModelProperty({required: true})
    name: string;

    @ApiModelProperty({required: true})
    @IsNotEmpty({
        message: "user_data_required"
    })
    @IsEmail({}, {
        message: "email_format"
    })
    email: string;

    constructor(name: string, email: string, phone: number, prefix: number) {
        super(phone, prefix);
        this.name = name;
        this.email = email;
    }
}
