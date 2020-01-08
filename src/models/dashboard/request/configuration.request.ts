export class ConfigurationRequest {
    minNgoTransfer: number;
    minPersonalPool: number;
    userExpiration: number;

    ngoPeriod: PeriodRequest;
    clientPeriod: PeriodRequest;
    partnerPeriod: PeriodRequest;

    constructor(ngoTransfer: number, personalPool: number, expiration: number, ngo: PeriodRequest, client: PeriodRequest, partner: PeriodRequest) {
        this.minNgoTransfer = ngoTransfer;
        this.minPersonalPool = personalPool;
        this.userExpiration = expiration;
        this.ngoPeriod = ngo;
        this.clientPeriod = client;
        this.partnerPeriod = partner;
    }
}

export class PeriodRequest {
    from: Date;
    interval: number;

    constructor(from: Date, interval: number) {
        this.from = from;
        this.interval = interval;
    }
}
