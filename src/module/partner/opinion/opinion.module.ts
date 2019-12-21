import { Module } from "@nestjs/common";
import { PartnerOpinionController } from "./opinion.controller";

@Module({
    controllers: [PartnerOpinionController]
})
export class PartnerOpinionModule {
}