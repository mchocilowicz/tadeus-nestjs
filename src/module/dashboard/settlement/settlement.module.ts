import {Module} from "@nestjs/common";
import {SettlementController} from "./settlement.controller";


@Module({
    controllers: [SettlementController],
    providers: [],
    imports: []
})
export class SettlementModule {
}
