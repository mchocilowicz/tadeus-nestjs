import { Module } from "@nestjs/common";
import { TransactionController } from "./transaction.controller";
import { CalculationService } from "../../../common/service/calculation.service";
import { CodeService } from "../../../common/service/code.service";


@Module({
    imports: [],
    controllers: [TransactionController],
    providers: [CalculationService, CodeService],
})
export class TransactionModule {
}
