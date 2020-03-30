import { Module } from "@nestjs/common";
import { LoginService } from "../common/login.service";
import { CodeService } from "../../common/service/code.service";
import { DashboardController } from "./dashboard.controller";
import { TadeusJwtModule } from "../common/TadeusJwtModule/tadeusJwt.module";
import { CryptoService } from "../../common/service/crypto.service";
import { SmsService } from "../common/sms.service";


@Module({
    imports: [
        TadeusJwtModule,
    ],
    providers: [
        LoginService, CodeService, CryptoService, SmsService
    ],
    controllers: [
        DashboardController
    ]
})
export class DashboardModule {
}
