import {Module} from "@nestjs/common";
import {PartnerSettingsController} from "./partner-settings.controller";

@Module({
    imports: [],
    controllers: [PartnerSettingsController],
    providers: [],
})
export class PartnerSettingsModule {
}
