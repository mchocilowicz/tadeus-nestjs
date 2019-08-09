import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from "../../database/entity/user.entity";
import { RoleEnum } from "../../common/enum/role.enum";
import { VirtualCard } from "../../database/entity/virtual-card.entity";
import { Role } from "../../database/entity/role.entity";
import { Status } from "../../common/enum/status.enum";
import { TadeusJwtService } from "../common/TadeusJwtModule/TadeusJwtService";
import { CodeService } from "../../common/service/code.service";
import { CodeVerificationRequest } from "../../models/request/code-verification.request";
import { PhoneRequest } from "../../models/request/phone.request";

@Injectable()
export class LoginService {
    constructor(private readonly jwtService: TadeusJwtService, private readonly codeService: CodeService) {
    }

    async createAnonymousUser(): Promise<string> {
        let user = new User();
        let role = await Role.findOne({name: RoleEnum.ANONYMOUS});
        user.roles = [role];

        const virtualCard = new VirtualCard();
        virtualCard.cardNumber = this.codeService.generateVirtualCardNumber();

        try {
            user.virtualCard = await virtualCard.save();
            let savedUser = await user.save();

            return this.jwtService.signToken({id: savedUser.id})
        } catch (e) {
            throw new BadRequestException("user_not_created")
        }

    }

    async checkVerificationCode(dto: CodeVerificationRequest): Promise<string> {
        let user = await User.findOne({phone: dto.phone, code: dto.code});

        if (!user) {
            throw new NotFoundException('invalid_code')
        }
        return this.jwtService.signToken({id: user.id})
    }

    async signIn(phone: PhoneRequest, role: RoleEnum): Promise<void> {
        let user = await User.findOne({phone: phone.phone}, {relations: ['roles']});
        if (!user) {
            console.log(user);
            throw new NotFoundException('user_no_exists')
        }
        this.checkUserRights(user, role);
        user.code = this.codeService.generateSmsCode();

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
