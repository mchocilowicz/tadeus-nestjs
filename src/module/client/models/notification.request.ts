import { ApiModelProperty } from "@nestjs/swagger";

export class NotificationRequest {
    @ApiModelProperty()
    email: string;
    @ApiModelProperty()
    value: string;
}
