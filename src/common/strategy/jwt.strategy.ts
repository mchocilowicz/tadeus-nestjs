import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "../../database/entity/user.entity";
import { CryptoService } from "../service/crypto.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly cryptoService: CryptoService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.TADEUS_JWT_EVEREST,
        });
    }

    async validate(payload: { id: string }) {
        let userId = this.cryptoService.decryptId(payload.id);
        let token = this.cryptoService.generateToken(userId);
        const user = await User.findOne({id: userId}, {relations: ['ngo', 'card', 'tradingPoint', 'roles']});

        if (!user && user.token !== token) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
