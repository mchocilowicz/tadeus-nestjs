import { Module } from "@nestjs/common";
import { PartnerOpinionController } from "../opinion/partner-opinion.controller";
import {PartnerDonationController} from "./partner-donation.controller";
import {CodeService} from "../../../common/service/code.service";

@Module({
    controllers: [PartnerDonationController],
    providers: [CodeService]
})
export class PartnerDonationModule {
}
