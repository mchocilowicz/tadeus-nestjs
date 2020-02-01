import {ApiProperty} from "@nestjs/swagger";
import {IsNumber, Max, Min} from "class-validator";
import {PhoneRequest} from "./phone.request";

export class CodeVerificationRequest extends PhoneRequest {
    @ApiProperty({required: true})
    @IsNumber({}, {message: 'code_format'})
    @Max(9999, {message: 'code_max_value'})
    @Min(1000, {message: 'code_max_value'})
    readonly code: number;

    constructor(phone: number, code: number, prefix: number) {
        super(phone, prefix);
        this.code = code;
    }
}
