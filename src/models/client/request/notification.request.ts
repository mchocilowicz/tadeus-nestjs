import {ApiModelProperty} from "@nestjs/swagger";

export class NotificationRequest {
    @ApiModelProperty()
    email: string;
    @ApiModelProperty()
    value: string;

    constructor(email: string, value: string) {
        this.email = email;
        this.value = value;
    }
}
