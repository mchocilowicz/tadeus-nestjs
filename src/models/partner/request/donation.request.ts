import {ApiModelProperty} from "@nestjs/swagger";

export class DonationRequest {
    @ApiModelProperty()
    donation: number;
    @ApiModelProperty()
    paymentId: string;
    @ApiModelProperty()
    payUextOrderId: string;

    constructor(orderId: string, price: number, paymentId: string) {
        this.payUextOrderId = orderId;
        this.donation = price;
        this.paymentId = paymentId;
    }
}
