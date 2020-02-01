import {ApiProperty} from "@nestjs/swagger";

export class SettingsRequest {
    @ApiProperty()
    defaultDonationPercent: number;
    @ApiProperty()
    defaultReceipt: number;

    constructor(donationPercentage: number, receipt: number) {
        this.defaultDonationPercent = donationPercentage;
        this.defaultReceipt = receipt;
    }
}
