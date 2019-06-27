import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { RegisterController } from "./register.controller";

@Module({
    imports: [
        AuthModule
    ],
    controllers: [RegisterController],
    providers: [],
})
export class RegisterModule {
}
