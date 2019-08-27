import { Module } from "@nestjs/common";
import { LoginService } from "../common/login.service";
import { CodeService } from "../../common/service/code.service";
import { TadeusJwtModule } from "../common/TadeusJwtModule/tadeusJwt.module";
import { DashboardController } from "./dashboard.controller";

@Module({
    imports: [
        TadeusJwtModule
    ],
    providers: [
        LoginService, CodeService
    ],
    controllers: [
        DashboardController
    ]
})
export class DashboardModule {
}
