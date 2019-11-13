export interface IDonationRequest {
    ngoDonationValue: number;
    tadeusDonationValue: number;
}

export class NgoDonationRequest {
    ngoDonationValue: number = 0;
    tadeusDonationValue: number = 0;

    constructor(request: IDonationRequest) {
        this.ngoDonationValue = Number(request.ngoDonationValue);
        this.tadeusDonationValue = Number(request.tadeusDonationValue);
    }
}

export interface ITadeusDonationRequest {
    donationValue: number
}

export class TadeusDonationRequest {
    donationValue: number;

    constructor(request: ITadeusDonationRequest) {
        this.donationValue = Number(request.donationValue);
    }
}
