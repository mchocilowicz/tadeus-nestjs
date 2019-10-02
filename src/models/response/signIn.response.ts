import { ApiModelProperty } from "@nestjs/swagger";

export class SignInResponse {
    @ApiModelProperty()
    userExists: boolean;
}
