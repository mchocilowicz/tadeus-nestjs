import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { TadeusJwtService } from "../../common/TadeusJwtModule/TadeusJwtService";
import { CodeService } from "../../../common/service/code.service";
import { NewPhoneRequest } from "../../../models/request/new-phone.request";
import { User } from "../../../database/entity/user.entity";
import { UserInformationRequest } from "../../../models/request/user-Information.request";
import { handleException } from "../../../common/util/functions";
import { CodeVerificationRequest } from "../../../models/request/code-verification.request";
import { RoleEnum } from "../../../common/enum/role.enum";
import { Role } from "../../../database/entity/role.entity";
import { Card } from "../../../database/entity/card.entity";
import { CardEnum } from "../../../common/enum/card.enum";
import { getConnection } from "typeorm";


@Injectable()
export class RegisterService {
    private readonly logger = new Logger(RegisterService.name);

    constructor(private readonly jwtService: TadeusJwtService, private readonly codeService: CodeService) {
    }

    async createUser(phone: NewPhoneRequest): Promise<void> {
        let user = await User.findOne({phone: phone.phone}, {relations: ['roles']});
        let anonymousUser = await User.findOne({id: phone.anonymousKey}, {relations: ['roles']});
        if (user && user.registered) {
            throw new BadRequestException("user_active")
        } else {
            if (anonymousUser) {
                await this.registerUser(anonymousUser)
            } else if (user) {
                await this.registerUser(user)
            } else {
                user = new User();
                user.phone = phone.phone;
                await this.registerUser(user)
            }
        }
    }

    async fillUserInformation(dto: UserInformationRequest): Promise<string> {
        let user = await User.findOne({phone: dto.phone});
        if (user === null) {
            throw new NotFoundException('user_not_exists')
        }
        if (user.registered) {
            throw new BadRequestException("user_active")
        } else {
            user.email = dto.email;
            user.name = dto.name;
            user.registered = true;
            user.xp = 50;

            const card = new Card();
            card.ID = this.codeService.generateVirtualCardNumber();
            card.type = CardEnum.VIRTUAL;

            try {
                await getConnection().transaction(async entityManager => {
                    user.card = await entityManager.save(card);
                    await entityManager.save(user);
                });
                return this.jwtService.signToken({id: user.id})
            } catch (e) {
                handleException(e, 'user', this.logger)
            }
        }

    }

    async checkCode(dto: CodeVerificationRequest) {
        let user = await User.findOne({phone: dto.phone, code: dto.code});
        if (!user) {
            throw new NotFoundException('invalid_code')
        }
    }

    private async registerUser(user: User) {
        let role = await Role.findOne({name: RoleEnum.CLIENT});
        if (!role) {
            throw new BadRequestException('user_not_created')
        }
        if (user.roles) {
            user.roles.push(role);
        } else {
            user.roles = [role]
        }
        user.ID = this.codeService.generateUserNumber();
        user.code = this.codeService.generateSmsCode();
        // await user.save().then(() => this.smsService.sendMessage(user.code, user.phone))
        try {
            await user.save();
        } catch (e) {
            console.log(e);
            handleException(e, 'user', this.logger)
        }
    }
}
