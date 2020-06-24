import { Module } from "@nestjs/common";
import { TadeusJwtModule } from "../../common/TadeusJwtModule/tadeusJwt.module";
import { LoginService } from "../../common/login.service";
import { CodeService } from "../../../common/service/code.service";
import { CryptoService } from "../../../common/service/crypto.service";
import { SmsService } from "../../common/sms.service";
import { DashboardRootController } from "./dashboard-root.controller";

@Module({
    imports: [TadeusJwtModule,],
    providers: [LoginService, CodeService, CryptoService, SmsService],
    controllers: [DashboardRootController]
})
export class DashboardRootModule {
}
