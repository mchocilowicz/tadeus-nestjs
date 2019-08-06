import { Module } from "@nestjs/common";
import { RegisterController } from "./register.controller";
import { RegisterService } from "./register.service";
import { TadeusJwtModule } from "../common/TadeusJwtModule/tadeusJwt.module";
import { CodeService } from "../../common/service/code.service";

@Module({
    imports: [
        TadeusJwtModule
    ],
    controllers: [RegisterController],
    providers: [RegisterService, CodeService],
})
export class RegisterModule {
}
