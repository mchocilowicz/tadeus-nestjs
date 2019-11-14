import { Module } from "@nestjs/common";
import { TradingPointController } from "./trading-point.controller";
import { CodeService } from "../../../common/service/code.service";

@Module({
    controllers: [TradingPointController],
    imports: [],
    providers: [CodeService]
})
export class TradingPointModule {
}
