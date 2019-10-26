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
        let {id, role} = this.cryptoService.decryptId(payload.id);

        let user: User | undefined;
        switch (role) {
            case RoleEnum.CLIENT:
                user = await this.getClient(id, role);
                break;
            case RoleEnum.TERMINAL:
                user = await this.getTerminal(id, role);
                break;
            case RoleEnum.DASHBOARD:
                user = await this.getDashboard(id, role);
                break;
        }

        if (!user) {
            throw new UnauthorizedException()
        }

        let accounts = user.accounts;

        if (!accounts) {
            throw new UnauthorizedException()
        }

        let account = accounts.find(a => a.role.value == role);
        if (account && account.code) {
            let token = this.cryptoService.generateToken(id, account.code);
            if (account.token !== token) {
                throw new UnauthorizedException('tokenExpired');
            }
        } else {
            throw new UnauthorizedException('tokenExpired');
        }

        return user;
    }

    async getTerminal(id: string, role: RoleEnum): Promise<User | undefined> {
        return await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .leftJoinAndSelect('user.terminal', 'terminal')
            .leftJoinAndSelect('terminal.tradingPoint', 'tradingPoint')
            .where(`accounts.id = :id`, {id: id})
            .andWhere(`role.name = :role`, {role: role})
            .getOne();
    }

    async getDashboard(id: string, role: RoleEnum): Promise<User | undefined> {
        return await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .where(`accounts.id = :id`, {id: id})
            .andWhere(`role.name = :role`, {role: role})
            .getOne();
    }

    async getClient(id: string, role: RoleEnum): Promise<User | undefined> {
        return await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .leftJoinAndSelect('user.card', 'card')
            .leftJoinAndSelect('user.details', 'details')
            .leftJoinAndSelect('details.ngo', 'ngo')
            .where(`accounts.id = :id`, {id: id})
            .andWhere(`role.name = :role`, {role: role})
            .getOne();
    }
}

