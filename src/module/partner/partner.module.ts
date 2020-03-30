import { Module } from "@nestjs/common";
import { PartnerController } from "./partner.controller";
import { LoginService } from "../common/login.service";
import { CodeService } from "../../common/service/code.service";
import { CryptoService } from "../../common/service/crypto.service";
import { TadeusJwtModule } from "../common/TadeusJwtModule/tadeusJwt.module";
import { SmsService } from "../common/sms.service";

@Module({
    controllers: [
        PartnerController
    ],
    providers: [
        LoginService, CodeService, CryptoService, SmsService
    ],
    imports: [
        TadeusJwtModule,
    ]
})
export class PartnerModule {
}
