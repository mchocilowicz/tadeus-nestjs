import {ApiModelProperty} from "@nestjs/swagger";

export class SettingsRequest {
    @ApiModelProperty()
    defaultDonationPercent: number;
    @ApiModelProperty()
    defaultReceipt: number;

    constructor(donationPercentage: number, receipt: number) {
        this.defaultDonationPercent = donationPercentage;
        this.defaultReceipt = receipt;
    }
}
