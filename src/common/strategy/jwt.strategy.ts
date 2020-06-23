import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "../../entity/user.entity";
import { CryptoService } from "../service/crypto.service";
import { RoleType } from "../enum/roleType";
import { Account } from "../../entity/account.entity";
import { Terminal } from "../../entity/terminal.entity";
import { Admin } from "../../entity/admin.entity";
import { Status } from "../enum/status.enum";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly cryptoService: CryptoService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: process.env.TDS_JWT_EVEREST,
        });
    }

    async validate(payload: { id: string }) {
        let {id, role} = this.cryptoService.decryptId(payload.id);

        if (role === RoleType.TERMINAL) {
            return await this.handleTerminalToken(id)
        } else if (role === RoleType.CLIENT) {
            const user = await User.getUserWithClientData(id);

            return this.verifiEntity(id, user);
        } else if (role === RoleType.DASHBOARD) {
            let admin = await Admin.createQueryBuilder('admin')
                                   .leftJoinAndSelect('admin.account', 'account')
                                   .leftJoinAndSelect('account.role', 'role')
                                   .where(`account.id = :id`, { id: id })
                                   .andWhere(`role.value = :role`, { role: RoleType.DASHBOARD })
                                   .andWhere(`account.status = :status`, { status: Status.ACTIVE })
                                   .getOne();

            return this.verifiEntity(id, admin)
        }
    }

    private async handleTerminalToken(id: string): Promise<Terminal> {
        let terminal = await Terminal.createQueryBuilder('terminal')
                                     .leftJoinAndSelect('terminal.account', 'account')
                                     .leftJoinAndSelect('account.role', 'role')
                                     .leftJoinAndSelect('terminal.tradingPoint', 'tradingPoint')
                                     .leftJoinAndSelect('terminal.phone', 'phone')
                                     .where(`account.id = :id`, { id: id })
                                     .andWhere(`role.value = :role`, { role: RoleType.TERMINAL })
                                     .andWhere(`account.status = :status`, {status: Status.ACTIVE})
                                     .getOne();

        return this.verifiEntity(id, terminal)
    }

    private verifiEntity(id: string, entity: any) {
        if (!entity) {
            throw new UnauthorizedException('user_does_not_exists')
        }

        let account = entity.account;

        if (!account) {
            throw new UnauthorizedException('user_does_not_exists')
        }

        this.checkAccount(id, account);
        return entity;
    }

    private checkAccount(id: string, account?: Account) {
        if (account && account.code) {
            let token = this.cryptoService.generateToken(id, account.code);
            if (account.token !== token) {
                throw new UnauthorizedException('token_Expired');
            }
        } else {
            throw new UnauthorizedException('token_Expired');
        }
    }
}

