import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { TadeusJwtService } from "./TadeusJwtModule/TadeusJwtService";
import { CodeService } from "../../common/service/code.service";
import { User } from "../../database/entity/user.entity";
import { Role } from "../../database/entity/role.entity";
import { RoleEnum } from "../../common/enum/role.enum";
import { Card } from "../../database/entity/card.entity";
import { CardEnum } from "../../common/enum/card.enum";
import { CodeVerificationRequest } from "../../models/request/code-verification.request";
import { PhoneRequest } from "../../models/request/phone.request";
import { Status, Step } from "../../common/enum/status.enum";
import { CryptoService } from "../../common/service/crypto.service";
import { getConnection } from "typeorm";

@Injectable()
export class LoginService {
    constructor(private readonly jwtService: TadeusJwtService,
                private readonly codeService: CodeService,
                private readonly cryptoService: CryptoService) {
    }


    async createAnonymousUser(): Promise<string> {
        let user = new User();
        let role = await Role.findOne({name: RoleEnum.ANONYMOUS});
        user.roles = [role];

        const virtualCard = new Card();
        virtualCard.ID = this.codeService.generateVirtualCardNumber();
        virtualCard.type = CardEnum.VIRTUAL;
        user.ID = this.codeService.generateUserNumber();
        try {
            let userId;
            await getConnection().transaction(async entityManager => {
                user.card = await entityManager.save(virtualCard);
                let savedUser = await entityManager.save(user);

                let token = this.cryptoService.generateToken(savedUser.id);
                userId = this.cryptoService.encryptId(savedUser.id);

                savedUser.token = token;

                await entityManager.save(savedUser);
            });
            return this.jwtService.signToken({id: userId})
        } catch (e) {
            throw new BadRequestException("user_not_created")
        }

    }

    async checkVerificationCode(dto: CodeVerificationRequest): Promise<string> {
        let user = await User.findOne({phone: dto.phone, code: dto.code});

        if (!user) {
            throw new NotFoundException('invalid_code')
        }
        let token = this.cryptoService.generateToken(user.id);
        user.token = token;

        let userId = this.cryptoService.encryptId(user.id);
        user.step = Step.ACTOVE;
        await user.save();
        return this.jwtService.signToken({id: userId})
    }

    async signIn(phone: PhoneRequest, role: RoleEnum): Promise<void> {
        let user = await User.findOne({phone: phone.phone}, {relations: ['roles']});
        if (!user) {
            throw new NotFoundException('user_no_exists')
        }
        this.checkUserRights(user, role);
        user.code = this.codeService.generateSmsCode();
        user.step = Step.CODE;
        // user.save().then(() => this.smsService.sendMessage(user.code, user.phone))
        await user.save()
    }

    private checkUserRights(user: User, role: RoleEnum) {
        if (!this.checkUserRole(user.roles, role) || user.status !== Status.ACTIVE) {
            throw new UnauthorizedException('account_blocked')
        }
    }

    private checkUserRole(userRoles: Role[], role: RoleEnum): boolean {
        return userRoles.some(r => r.name === role)
    }
}
