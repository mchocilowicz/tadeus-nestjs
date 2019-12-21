import { Module } from "@nestjs/common";
import { PartnerOpinionController } from "../opinion/opinion.controller";

@Module({
    controllers: [PartnerOpinionController]
})
export class PartnerDonationModule {
}