import { Module } from "@nestjs/common";
import { InformationController } from "./informationController";

@Module({
    controllers: [InformationController]
})
export class InformationModule {
}