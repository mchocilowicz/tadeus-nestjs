import {Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
import {TadeusJwtService} from "./TadeusJwtService";
import {CryptoService} from "../../../common/service/crypto.service";
import {JwtStrategy} from "../../../common/strategy/jwt.strategy";

@Module({
    imports: [
        PassportModule.register({defaultStrategy: 'jwt'}),
        JwtModule.register({
            secretOrPrivateKey: process.env.TDS_JWT_EVEREST,
        }),
    ],
    providers: [TadeusJwtService, CryptoService, JwtStrategy],
    exports: [TadeusJwtService]
})
export class TadeusJwtModule {
}
