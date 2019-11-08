import {ApiModelProperty} from "@nestjs/swagger";

export class SignInResponse {
    @ApiModelProperty()
    userExists: boolean;

    constructor(userExists: boolean) {
        this.userExists = userExists;
    }

}
