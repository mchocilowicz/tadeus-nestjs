export class TransactionResponse {
    price: number;
    donationPercentage: number;
    clientCode: string;

    constructor(price: number, percentage: number, code: string) {
        this.price = price;
        this.donationPercentage = percentage;
        this.clientCode = code;
    }
}
