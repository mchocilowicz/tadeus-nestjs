import {ExtractJwt, Strategy} from 'passport-jwt';
import {PassportStrategy} from "@nestjs/passport";
import {Injectable, UnauthorizedException} from "@nestjs/common";
import {User} from "../../database/entity/user.entity";
import {CryptoService} from "../service/crypto.service";
import {RoleEnum} from "../enum/role.enum";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly cryptoService: CryptoService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.TADEUS_JWT_EVEREST,
        });
    }

    async validate(payload: { id: string }) {
        let {id, role} = this.cryptoService.decryptId(payload.id);

        let user: User | undefined;
        switch (role) {
            case RoleEnum.CLIENT:
                user = await User.getUserWithClientData(id);
                break;
            case RoleEnum.TERMINAL:
                user = await User.getUserWithTerminalData(id);
                break;
            case RoleEnum.DASHBOARD:
                user = await User.getUserWithDashboardData(id);
                break;
        }

        if (!user) {
            throw new UnauthorizedException('user_does_not_exists')
        }

        let accounts = user.accounts;

        if (!accounts) {
            throw new UnauthorizedException('user_does_not_exists')
        }

        let account = accounts.find(a => a.role.value == role);
        if (account && account.code) {
            let token = this.cryptoService.generateToken(id, account.code);
            if (account.token !== token) {
                throw new UnauthorizedException('token_Expired');
            }
        } else {
            throw new UnauthorizedException('token_Expired');
        }

        return user;
    }
}

