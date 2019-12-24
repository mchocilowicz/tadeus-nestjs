import { Module } from "@nestjs/common";
import { PartnerTransactionController } from "./partner-transaction.controller";
import { CalculationService } from "../../../common/service/calculation.service";
import { CodeService } from "../../../common/service/code.service";


@Module({
    imports: [],
    controllers: [PartnerTransactionController],
    providers: [CalculationService, CodeService],
})
export class PartnerTransactionModule {
}
