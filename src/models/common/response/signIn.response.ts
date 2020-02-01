import {ApiProperty} from "@nestjs/swagger";

export class SignInResponse {
    @ApiProperty()
    userExists: boolean;

    constructor(userExists: boolean) {
        this.userExists = userExists;
    }

}
