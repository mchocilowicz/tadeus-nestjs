import {Module} from "@nestjs/common";
import {TradingPointTypeController} from "./trading-point-type.controller";

@Module({
    controllers: [TradingPointTypeController],
    imports: [],
    providers: []
})
export class TradingPointTypeModule {
}
