import { Module } from "@nestjs/common";
import { StatsModule } from "./stats/stats.module";
import { UserModule } from "./user/user.module";
import { TradingPointModule } from "./trading-point/trading-point.module";
import { ConfigurationModule } from "./configuration/configuration.module";
import { DashboardNgoModule } from "./ngo/dashboard-ngo.module";
import { SettlementModule } from "./settlement/settlement.module";
import { NgoTypeModule } from "./ngo-type/ngo-type.module";
import { DashboardTransactionModule } from "./transaction/transaction.module";
import { ReportsModule } from "./reports/reports.module";
import { RouterModule, Routes } from "nest-router";
import { DashboardRootModule } from "./root/dashboard-root.module";

const routes: Routes = [{
    path: '/dashboard', module: DashboardRootModule, children: [{
        path: '/stats', module: StatsModule
    }, {
        path: '/user', module: UserModule
    }, {
        path: '/trading-point', module: TradingPointModule,
    }, {
        path: '/configuration', module: ConfigurationModule
    }, {
        path: '/ngo', module: DashboardNgoModule
    }, {
        path: '/settlement', module: SettlementModule
    }, {
        path: '/ngo-type', module: NgoTypeModule
    }, {
        path: '/transaction', module: DashboardTransactionModule
    }, {
        path: '/reports', module: ReportsModule
    }]
}]

@Module({
    imports: [RouterModule.forRoutes(routes), DashboardRootModule, StatsModule, UserModule, TradingPointModule, ConfigurationModule, DashboardNgoModule, SettlementModule, NgoTypeModule, DashboardTransactionModule, ReportsModule]
})
export class DashboardModule {
}
