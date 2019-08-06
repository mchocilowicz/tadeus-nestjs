import { Module } from "@nestjs/common";
import { LoginController } from "./login.controller";
import { LoginService } from "./login.service";
import { SmsService } from "./sms.service";
import { TadeusJwtModule } from "../common/TadeusJwtModule/tadeusJwt.module";
import { CodeService } from "../../common/service/code.service";


@Module({
    imports: [
        TadeusJwtModule
    ],
    providers: [LoginService, SmsService, CodeService],
    controllers: [LoginController],
    exports: []
})
export class LoginModule {
}
