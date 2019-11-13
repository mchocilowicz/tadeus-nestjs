export class ConfigurationResponse {
    id: string = '';
    minNgoTransfer: number = 0;
    minPersonalPool: number = 0;
    currentClientPaymentDate: Date = new Date();
    clientCycleDays: number = 0;
    nextClientPaymentDate: Date = new Date();
    currentPartnerPaymentDate: Date = new Date();
    partnerCycleDays: number = 0;
    nextPartnerPaymentDate: Date = new Date();
    currentNgoPaymentDate: Date = new Date();
    ngoCycleDays: number = 0;
    nextNgoPaymentDate: Date = new Date();
}
