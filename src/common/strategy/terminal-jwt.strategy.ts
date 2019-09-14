import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "../../database/entity/user.entity";
import { CryptoService } from "../service/crypto.service";
import { createQueryBuilder } from "typeorm";
import { RoleEnum } from "../enum/role.enum";

@Injectable()
export class TerminalJwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly cryptoService: CryptoService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.TADEUS_JWT_EVEREST,
        });
    }

    async validate(payload: { id: string }) {
        let userId = this.cryptoService.decryptId(payload.id);

        let user: any = await createQueryBuilder('User', 'user')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .leftJoinAndSelect('user.terminal', 'terminal')
            .leftJoinAndSelect('terminal.tradingPoint', 'tradingPoint')
            .where(`account.id = ${userId}`)
            .andWhere(`role.name = ${RoleEnum.TERMINAL}`);
        let account = user.accounts.find(a => a.role.name === RoleEnum.TERMINAL);

        let token = this.cryptoService.generateToken(userId, account.code);
        if (!user && account.token !== token) {
            throw new UnauthorizedException('tokenExpired');
        }
        return user.terminal;
    }
}
