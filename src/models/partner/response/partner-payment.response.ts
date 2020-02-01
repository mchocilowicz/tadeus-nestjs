export class PartnerPaymentResponse {
    price: number = 0;
    date?: Date;
    code: string;
    hasPayments: boolean = false;

    constructor(price: number, code: string, hasPayments: boolean, paymentAt?: Date) {
        this.date = paymentAt;
        this.price = price;
        this.code = code;
        this.hasPayments = hasPayments;
    }
}
