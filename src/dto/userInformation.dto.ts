import { ApiModelProperty } from "@nestjs/swagger";

export class UserInformationDto {
    @ApiModelProperty({required: true})
    phone: string;
    @ApiModelProperty({required: true})
    name: string;
    @ApiModelProperty({required: true})
    email: string;
}
