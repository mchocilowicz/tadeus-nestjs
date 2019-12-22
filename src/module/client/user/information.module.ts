import { Module } from "@nestjs/common";
import { InformationController } from "./information.controller";

@Module({
    controllers: [InformationController]
})
export class InformationModule {
}