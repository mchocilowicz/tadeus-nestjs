import { Module } from "@nestjs/common";
import { RouterModule, Routes } from "nest-router";
import { PartnerTransactionModule } from "./transaction/partner-transaction.module";
import { PartnerTerminalModule } from "./terminal/partner-terminal.module";
import { PartnerSettingsModule } from "./settings/partner-settings.module";
import { PartnerDonationModule } from "./donation/partner-donation.module";
import { PartnerOpinionModule } from "./opinion/partner-opinion.module";
import { PartnerRootModule } from "./root/partner-root.module";


const routes: Routes = [{
    path: '/partner', module: PartnerRootModule, children: [{
        path: '/transaction', module: PartnerTransactionModule
    }, {
        path: '/terminal', module: PartnerTerminalModule
    }, {
        path: '/settings', module: PartnerSettingsModule
    }, {
        path: '/donation', module: PartnerDonationModule
    }, {
        path: '/opinion', module: PartnerOpinionModule
    }]
},]

@Module({
    imports: [RouterModule.forRoutes(routes), PartnerRootModule, PartnerDonationModule, PartnerOpinionModule, PartnerSettingsModule, PartnerTransactionModule]
})
export class PartnerModule {
}
