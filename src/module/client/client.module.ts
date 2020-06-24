import { Module } from "@nestjs/common";
import { RouterModule, Routes } from "nest-router";
import { NgoModule } from "./ngo/ngo.module";
import { RegisterModule } from "./register/register.module";
import { PlaceModule } from "./place/place.module";
import { DonationModule } from "./donation/donation.module";
import { InformationModule } from "./user/information.module";
import { OpinionModule } from "./opinion/opinion.module";
import { PayoutModule } from "./payout/payout.module";
import { ClientRootModule } from "./root/client-root.module";

const routes: Routes = [{
    path: '/client', module: ClientRootModule, children: [{
        path: '/ngo', module: NgoModule
    }, {
        path: '/register', module: RegisterModule
    }, {
        path: '/place', module: PlaceModule
    }, {
        path: '/donation', module: DonationModule
    }, {
        path: '/information', module: InformationModule
    }, {
        path: '/opinion', module: OpinionModule
    }, {
        path: '/payout', module: PayoutModule
    }]
}];

@Module({
    imports: [RouterModule.forRoutes(routes), NgoModule, RegisterModule, PlaceModule, DonationModule, InformationModule, OpinionModule, PayoutModule, ClientRootModule],
})
export class ClientModule {
}
