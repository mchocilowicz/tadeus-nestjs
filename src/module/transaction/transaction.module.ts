import { Module } from "@nestjs/common";
import { CalculationService } from "../../common/service/calculation.service";

@Module({
    imports: [],
    controllers: [],
    providers: [CalculationService],
})
export class TransactionModule {
}
