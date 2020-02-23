export class ConfigurationSaveRequest {
    minNgoTransfer: number;
    minPersonalPool: number;
    userExpiration: number;
    userCloseInterval: number;
    partnerEmailInterval: number;
    partnerCloseInterval: number;
    ngoGenerateInterval: number;
    ngoCloseInterval: number;

    constructor(minNgoTransfer: number, minPersonalPool: number, userExpiration: number, userCloseInterval: number, partnerEmailInterval: number, partnerCloseInterval: number, ngoGenerateInterval: number, ngoCloseInterval: number) {
        this.minNgoTransfer = minNgoTransfer;
        this.minPersonalPool = minPersonalPool;
        this.userExpiration = userExpiration;
        this.userCloseInterval = userCloseInterval;
        this.partnerEmailInterval = partnerEmailInterval;
        this.partnerCloseInterval = partnerCloseInterval;
        this.ngoGenerateInterval = ngoGenerateInterval;
        this.ngoCloseInterval = ngoCloseInterval;
    }
}
