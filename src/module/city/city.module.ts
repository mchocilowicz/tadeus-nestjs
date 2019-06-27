import { Module } from "@nestjs/common";
import { CityController } from "./city.controller";

@Module({
    imports: [],
    controllers: [CityController],
    providers: [],
})
export class CityModule {
}
