import { Module } from "@nestjs/common";
import { TadeusJwtModule } from "../../common/TadeusJwtModule/tadeusJwt.module";
import { ClientRootController } from "./client-root.controller";
import { CodeService } from "../../../common/service/code.service";
import { LoginService } from "../../common/login.service";
import { CryptoService } from "../../../common/service/crypto.service";
import { CalculationService } from "../../../common/service/calculation.service";
import { SmsService } from "../../common/sms.service";

@Module({
    imports: [TadeusJwtModule,],
    controllers: [ClientRootController],
    providers: [CodeService, LoginService, CryptoService, CalculationService, SmsService],
})
export class ClientRootModule {
}
