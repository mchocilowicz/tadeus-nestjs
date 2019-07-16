import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "../../database/entity/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'secretKey',
        });
    }

    async validate(payload: { id: string }) {
        const user = await User.findOne({id: payload.id}, {relations: ['ngo', 'virtualCard', 'tradingPoint', 'roles']});
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
