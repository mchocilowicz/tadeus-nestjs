import {ApiModelProperty} from "@nestjs/swagger";

export class DonationRequest {
    @ApiModelProperty()
    payUextOrderId: string;

    constructor(orderId: string) {
        this.payUextOrderId = orderId;
    }
}
