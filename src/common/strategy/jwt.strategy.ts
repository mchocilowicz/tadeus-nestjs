import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "../../database/entity/user.entity";
import { CryptoService } from "../service/crypto.service";
import { RoleEnum } from "../enum/role.enum";

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
        const user = await User.findOne({id: userId}, {relations: ['account', 'account.role']});
        let account = user.accounts.find(a => a.role.name == RoleEnum.CLIENT);
        if (account) {
            let token = this.cryptoService.generateToken(userId, account.code);
            if (!user && account.token !== token) {
                throw new UnauthorizedException('tokenExpired');
            }
        } else {
            throw new UnauthorizedException('tokenExpired');
        }
        return user;
    }
}
