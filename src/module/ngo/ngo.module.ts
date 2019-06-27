import { Module } from "@nestjs/common";
import { NgoController } from "./ngo.controller";

@Module({
    imports: [],
    controllers: [NgoController],
    providers: [],
})
export class NgoModule {
}
