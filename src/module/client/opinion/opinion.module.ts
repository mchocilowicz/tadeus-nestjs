import { Module } from "@nestjs/common";
import { OpinionController } from "./opinion.controller";

@Module({
    controllers: [OpinionController]
})
export class OpinionModule {
}