import { Module } from "@nestjs/common";
import { CalculationService } from "../../common/service/calculation.service";
import { TransactionController } from "./transaction.controller";

@Module({
    imports: [],
    controllers: [TransactionController],
    providers: [CalculationService],
})
export class TransactionModule {
}
