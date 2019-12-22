import { PartnerPayment } from "../../../database/entity/partner-payment.entity";

export class PartnerPaymentResponse {
    paymentId: string;
    price: number;
    date: Date;
    code: string;

    constructor(date: Date, payment: PartnerPayment, code: string) {
        this.paymentId = payment.id;
        this.price = payment.price;
        this.date = date;
        this.code = code;
    }
}