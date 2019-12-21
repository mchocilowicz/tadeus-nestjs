import { Module } from "@nestjs/common";
import { SettingsController } from "./settings.controller";

@Module({
    imports: [],
    controllers: [SettingsController],
    providers: [],
})
export class SettingsModule {
}