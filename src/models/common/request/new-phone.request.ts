import {ApiProperty} from "@nestjs/swagger";
import {IsOptional} from "class-validator";
import {PhoneRequest} from "./phone.request";

export class NewPhoneRequest extends PhoneRequest {
    @IsOptional()
    @ApiProperty({description: 'Key obtained while creating Anonymous User'})
    anonymousKey: string;

    constructor(phone: number, prefix: number, key: string) {
        super(phone, prefix);
        this.anonymousKey = key;
    }
}
