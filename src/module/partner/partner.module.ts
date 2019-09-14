import { Module } from "@nestjs/common";
import { PartnerController } from "./partner.controller";
import { LoginService } from "../common/login.service";
import { CodeService } from "../../common/service/code.service";
import { TadeusJwtModule } from "../common/TadeusJwtModule/tadeusJwt.module";
import { CryptoService } from "../../common/service/crypto.service";
import { TerminalJwtStrategy } from "../../common/strategy/terminal-jwt.strategy";

@Module({
    controllers: [
        PartnerController
    ],
    providers: [
        LoginService, CodeService, CryptoService, TerminalJwtStrategy
    ],
    imports: [
        TadeusJwtModule
    ]
})
export class PartnerModule {
}
