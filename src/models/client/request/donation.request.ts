import {ApiModelProperty} from "@nestjs/swagger";

export class NgoDonationRequest {
    @ApiModelProperty()
    ngoId?: string;
    @ApiModelProperty()
    ngoDonation: number = 0;
    @ApiModelProperty()
    tadeusDonation: number = 0;
    @ApiModelProperty()
    payUextOrderId: string;

    constructor(ngoId: string, orderId: string) {
        this.ngoId = ngoId;
        this.payUextOrderId = orderId;
    }
}
