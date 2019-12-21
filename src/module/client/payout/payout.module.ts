import { Module } from "@nestjs/common";
import { PayoutController } from "./payout.controller";

@Module({
    imports: [],
    controllers: [PayoutController],
    providers: [],
})
export class PayoutModule {
}
