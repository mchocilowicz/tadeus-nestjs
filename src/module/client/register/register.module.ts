import { Module } from "@nestjs/common";
import { RegisterController } from "./register.controller";
import { RegisterService } from "./register.service";
import { TadeusJwtModule } from "../../common/TadeusJwtModule/tadeusJwt.module";
import { CodeService } from "../../../common/service/code.service";
import { CryptoService } from "../../../common/service/crypto.service";
import { LoginService } from "../../common/login.service";

@Module({
    imports: [
        TadeusJwtModule
    ],
    controllers: [RegisterController],
    providers: [RegisterService, CodeService, CryptoService, LoginService],
})
export class RegisterModule {
}
