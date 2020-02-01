import {ApiProperty} from "@nestjs/swagger";

export class NgoDonationRequest {
    @ApiProperty()
    ngoId?: string;
    @ApiProperty()
    ngoDonation: number = 0;
    @ApiProperty()
    tadeusDonation: number = 0;
    @ApiProperty()
    payUextOrderId: string;

    constructor(ngoId: string, orderId: string) {
        this.ngoId = ngoId;
        this.payUextOrderId = orderId;
    }
}
