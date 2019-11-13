import {ApiModelProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsNumber} from "class-validator";
import {PhonePrefixExists} from "../../../common/decorators/phone-prefix-exists.decorator";
import {PhoneLength} from "../../../common/decorators/phone-length.decorator";

export class PhoneRequest {
    @ApiModelProperty({description: 'Phone number prefix', required: true})
    @IsNotEmpty({message: 'phone_prefix_required'})
    @PhonePrefixExists({message: 'phone_prefix_not_exists'})
    phonePrefix: number;

    @ApiModelProperty({description: 'Phone number', required: true})
    @IsNotEmpty({
        message: "phone_required"
    })
    @IsNumber({allowNaN: false}, {message: 'phone_format'})
    @PhoneLength('phonePrefix', {message: 'phone_format'})
    phone: number;

    constructor(phone: number, prefix: number) {
        this.phone = Number(phone);
        this.phonePrefix = Number(prefix);
    }
}
