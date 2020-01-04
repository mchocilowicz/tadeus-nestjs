import { PartnerPayment } from "../../../database/entity/partner-payment.entity";

export class PartnerPaymentResponse {
    paymentId: string = '';
    price: number = 0;
    date: Date;

    constructor(date: Date, payment?: PartnerPayment) {
        if (payment) {
            this.paymentId = payment.id;
            this.price = payment.price;
        }
        this.date = date;
    }
}