import {Module} from "@nestjs/common";
import {PartnerOpinionController} from "./partner-opinion.controller";

@Module({
    controllers: [PartnerOpinionController]
})
export class PartnerOpinionModule {
}
