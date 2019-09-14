import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { TadeusJwtService } from "./TadeusJwtService";
import { CryptoService } from "../../../common/service/crypto.service";

@Module({
    imports: [
        PassportModule.register({defaultStrategy: 'jwt'}),
        JwtModule.register({
            secretOrPrivateKey: process.env.TADEUS_JWT_EVEREST,
        }),
    ],
    providers: [TadeusJwtService, CryptoService],
    exports: [TadeusJwtService]
})
export class TadeusJwtModule {
}
