import { ApiModelProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { PhoneRequest } from "./phone.request";

export class NewPhoneRequest extends PhoneRequest {
    @IsOptional()
    @ApiModelProperty({description: 'Key obtained while creating Anonymous User'})
    anonymousKey: string;

    constructor(phone: string, prefix: string, key: string) {
        super(phone, prefix);
        this.anonymousKey = key;
    }
}
