import { Module } from "@nestjs/common";
import { LoginService } from "../common/login.service";
import { CodeService } from "../../common/service/code.service";
import { DashboardController } from "./dashboard.controller";
import { TadeusJwtModule } from "../common/TadeusJwtModule/tadeusJwt.module";
import { CryptoService } from "../../common/service/crypto.service";
import { RouterModule, Routes } from "nest-router";
import { UserModule } from "./user/user.module";
import { TradingPointModule } from "./trading-point/trading-point.module";
import { ConfigurationModule } from "./configuration/configuration.module";
import { DashboardNgoModule } from "./ngo/dashboard-ngo.module";
import { TradingPointTypeModule } from "./trading-point-type/trading-point-type.module";
import { NgoTypeModule } from "./ngo-type/ngo-type.module";

const routes: Routes = [
    {
        path: '/user',
        module: UserModule
    },
    {
        path: '/trading-point',
        module: TradingPointModule,
    },
    {
        path: '/configuration',
        module: ConfigurationModule
    },
    {
        path: '/ngo',
        module: DashboardNgoModule
    },
    {
        path: '/trading-point-type',
        module: TradingPointTypeModule
    },
    {
        path: '/ngo-type',
        module: NgoTypeModule
    }
];

@Module({
    imports: [
        TadeusJwtModule,
        RouterModule.forRoutes(routes),
        UserModule,
        TradingPointModule,
        TradingPointTypeModule,
        ConfigurationModule,
        DashboardNgoModule,
        NgoTypeModule
    ],
    providers: [
        LoginService, CodeService, CryptoService
    ],
    controllers: [
        DashboardController
    ]
})
export class DashboardModule {
}
