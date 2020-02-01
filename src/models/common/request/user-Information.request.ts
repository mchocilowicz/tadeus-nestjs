import {ApiProperty} from "@nestjs/swagger";
import {IsAlpha, IsEmail, IsNotEmpty, IsOptional} from "class-validator";
import {PhoneRequest} from "./phone.request";

export class UserInformationRequest extends PhoneRequest {
    @IsNotEmpty({
        message: "user_data_required"
    })
    @IsAlpha({
        message: "name_format"
    })
    @ApiProperty({required: true})
    name: string;

    @ApiProperty({required: true})
    @IsOptional()
    @IsEmail({}, {
        message: "email_format"
    })
    email?: string;

    constructor(name: string, phone: number, prefix: number) {
        super(phone, prefix);
        this.name = name;
    }
}
