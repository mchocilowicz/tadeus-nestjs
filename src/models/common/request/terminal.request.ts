import { PhoneRequest } from "./phone.request";
import { ApiModelProperty } from "@nestjs/swagger";
import { IsAlphanumeric, IsNotEmpty } from "class-validator";

export class TerminalRequest extends PhoneRequest {

    @ApiModelProperty({description: 'Terminal user name', required: true})
    @IsAlphanumeric({
        message: "terminal_name_format",
    })
    @IsNotEmpty({
        message: "terminal_name_required"
    })
    name: string;

    constructor(name: string, phone: number, prefix: number) {
        super(phone, prefix);
        this.name = name;
    }
}