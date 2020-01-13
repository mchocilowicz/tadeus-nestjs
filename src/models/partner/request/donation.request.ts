import { ApiProperty } from "@nestjs/swagger";

export class DonationRequest {
    @ApiProperty()
    donation: number;
    @ApiProperty()
    paymentId: string;
    @ApiProperty()
    payUextOrderId: string;

    constructor(orderId: string, price: number, paymentId: string) {
        this.payUextOrderId = orderId;
        this.donation = price;
        this.paymentId = paymentId;
    }
}
