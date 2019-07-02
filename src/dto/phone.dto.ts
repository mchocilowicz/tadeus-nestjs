import { ApiModelProperty } from "@nestjs/swagger";

export class PhoneDto {
    @ApiModelProperty()
    phone: string
}
