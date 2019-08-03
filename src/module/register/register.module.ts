import { Module } from "@nestjs/common";
import { LoginModule } from "../login/login.module";
import { RegisterController } from "./register.controller";
import { RegisterService } from "./register.service";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [
        LoginModule,
        PassportModule.register({defaultStrategy: 'jwt'}),
        JwtModule.register({
            secretOrPrivateKey: 'secretKey',
            signOptions: {
                expiresIn: 3600,
            },
        }),
    ],
    controllers: [RegisterController],
    providers: [RegisterService],
})
export class RegisterModule {
}
