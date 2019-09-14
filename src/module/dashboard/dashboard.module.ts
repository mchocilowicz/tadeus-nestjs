import { Module } from "@nestjs/common";
import { LoginService } from "../common/login.service";
import { CodeService } from "../../common/service/code.service";
import { TadeusJwtModule } from "../common/TadeusJwtModule/tadeusJwt.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardJwtStrategy } from "../../common/strategy/dashboard-jwt.strategy";

@Module({
    imports: [
        TadeusJwtModule
    ],
    providers: [
        LoginService, CodeService, DashboardJwtStrategy
    ],
    controllers: [
        DashboardController
    ]
})
export class DashboardModule {
}
