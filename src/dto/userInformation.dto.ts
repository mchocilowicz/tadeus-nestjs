import { ApiModelProperty } from "@nestjs/swagger";

export class UserInformationDto {
    @ApiModelProperty()
    phone: string;
    @ApiModelProperty()
    name: string;
    @ApiModelProperty()
    email: string;
}
