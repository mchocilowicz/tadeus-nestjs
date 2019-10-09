export class ConfigurationResponse {
    id: string;
    minNgoTransfer: number;
    minPersonalPool: number;
    currentClientPaymentDate: Date;
    clientCycleDays: number;
    nextClientPaymentDate: Date;
    currentPartnerPaymentDate: Date;
    partnerCycleDays: number;
    nextPartnerPaymentDate: Date;
    currentNgoPaymentDate: Date;
    ngoCycleDays: number;
    nextNgoPaymentDate: Date;
}
