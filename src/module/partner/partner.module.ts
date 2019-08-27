import { Module } from "@nestjs/common";
import { PartnerController } from "./partner.controller";
import { LoginService } from "../common/login.service";
import { CodeService } from "../../common/service/code.service";
import { TadeusJwtModule } from "../common/TadeusJwtModule/tadeusJwt.module";
import { CryptoService } from "../../common/service/crypto.service";

@Module({
    controllers: [
        PartnerController
    ],
    providers: [
        LoginService, CodeService, CryptoService
    ],
    imports: [
        TadeusJwtModule
    ]
})
export class PartnerModule {
}
