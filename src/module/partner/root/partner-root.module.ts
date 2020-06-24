import { Module } from "@nestjs/common";
import { PartnerRootController } from "./partner-root.controller";
import { LoginService } from "../../common/login.service";
import { CodeService } from "../../../common/service/code.service";
import { CryptoService } from "../../../common/service/crypto.service";
import { SmsService } from "../../common/sms.service";
import { TadeusJwtModule } from "../../common/TadeusJwtModule/tadeusJwt.module";

@Module({
    controllers: [PartnerRootController],
    providers: [LoginService, CodeService, CryptoService, SmsService],
    imports: [TadeusJwtModule,]
})
export class PartnerRootModule {
}
