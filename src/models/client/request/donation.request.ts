export class NgoDonationRequest {
    ngoId?: string;
    ngoDonation: number = 0;
    tadeusDonation: number = 0;
    payUextOrderId: string;

    constructor(ngoId: string, orderId: string) {
        this.ngoId = ngoId;
        this.payUextOrderId = orderId;
    }
}
