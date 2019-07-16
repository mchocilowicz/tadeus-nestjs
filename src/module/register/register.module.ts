import { Module } from "@nestjs/common";
import { LoginModule } from "../login/login.module";
import { RegisterController } from "./register.controller";
import { RegisterService } from "./register.service";

@Module({
    imports: [
        LoginModule
    ],
    controllers: [RegisterController],
    providers: [RegisterService],
})
export class RegisterModule {
}
