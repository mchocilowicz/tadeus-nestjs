export class ConfigurationSaveRequest {
    minNgoTransfer: number;
    minPersonalPool: number;
    userExpiration: number;
    userCloseInterval: number;
    partnerEmailInterval: number;
    partnerCloseInterval: number;
    ngoGenerateInterval: number;
    ngoCloseInterval: number;
    personalPoolFrequency: number;
    donationPoolFrequency: number;

    constructor(minNgoTransfer: number, minPersonalPool: number, userExpiration: number,
                userCloseInterval: number, partnerEmailInterval: number, partnerCloseInterval: number,
                ngoGenerateInterval: number, ngoCloseInterval: number, personalPoolFrequency: number,
                donationPoolFrequency: number) {
        this.minNgoTransfer = minNgoTransfer;
        this.minPersonalPool = minPersonalPool;
        this.userExpiration = userExpiration;
        this.userCloseInterval = userCloseInterval;
        this.partnerEmailInterval = partnerEmailInterval;
        this.partnerCloseInterval = partnerCloseInterval;
        this.ngoGenerateInterval = ngoGenerateInterval;
        this.ngoCloseInterval = ngoCloseInterval;
        this.personalPoolFrequency = personalPoolFrequency;
        this.donationPoolFrequency = donationPoolFrequency;
    }
}
