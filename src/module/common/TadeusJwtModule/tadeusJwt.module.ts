import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "../../../common/strategy/jwt.strategy";
import { TadeusJwtService } from "./TadeusJwtService";

@Module({
    imports: [
        PassportModule.register({defaultStrategy: 'jwt'}),
        JwtModule.register({
            secretOrPrivateKey: 'secretKey',
            signOptions: {
                expiresIn: 3600,
            },
        }),
    ],
    providers: [JwtStrategy, TadeusJwtService],
    exports: [TadeusJwtService]
})
export class TadeusJwtModule {
}
