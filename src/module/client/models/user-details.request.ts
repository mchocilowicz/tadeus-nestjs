import { ApiModelProperty } from "@nestjs/swagger";

export class UserDetailsRequest {
    @ApiModelProperty()
    firstName: string;
    @ApiModelProperty()
    lastName: string;
    @ApiModelProperty()
    bankAccount: number;
    @ApiModelProperty()
    phonePrefix: string;
    @ApiModelProperty()
    phone: string;
    @ApiModelProperty()
    email: string;
}
