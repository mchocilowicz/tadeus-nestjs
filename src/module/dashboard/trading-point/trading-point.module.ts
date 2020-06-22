import {Module} from "@nestjs/common";
import {TradingPointController} from "./trading-point.controller";
import {CodeService} from "../../../common/service/code.service";
import {TerminalService} from "../../common/terminal.service";

@Module({
    controllers: [TradingPointController],
    imports: [],
    providers: [CodeService, TerminalService]
})
export class TradingPointModule {
}
