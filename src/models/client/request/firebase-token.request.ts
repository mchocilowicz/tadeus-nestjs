import {ApiModelProperty} from "@nestjs/swagger";

export class FirebaseTokenRequest {
    @ApiModelProperty()
    token: string;
    @ApiModelProperty()
    platform: string;

    constructor(token: string, platform: string) {
        this.token = token;
        this.platform = platform;
    }
}
