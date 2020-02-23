import {Module} from "@nestjs/common";
import {DashboardTransactionController} from "./transaction.controller";

@Module({
    controllers: [DashboardTransactionController],
    imports: [],
    providers: []
})
export class DashboardTransactionModule {
}
