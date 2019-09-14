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
import { getConnection } from "typeorm";
import { Account } from "../../../database/entity/account.entity";
import { UserDetails } from "../../../database/entity/user-details.entity";
import { VirtualCard } from "../../../database/entity/virtual-card.entity";


@Injectable()
export class RegisterService {
    private readonly logger = new Logger(RegisterService.name);

    constructor(private readonly jwtService: TadeusJwtService, private readonly codeService: CodeService) {
    }

    async createUser(phone: NewPhoneRequest): Promise<void> {
        let phoneNumber = phone.phonePrefix + phone.phone;
        // let user = await createQueryBuilder('User', 'user')
        //     .leftJoinAndSelect('user.account','account')
        //     .leftJoinAndSelect('account.role', 'role')
        //     .where('role.name = :name', {name: RoleEnum.CLIENT})
        //     .andWhere('user.phone = :phone', {phone: phoneNumber})
        //     .getOne();
        let user = await User.findOne({phone: phoneNumber}, {
            relations: ['account', 'account.role'], where: {
                'account.role.name': RoleEnum.CLIENT
            }
        });
        let anonymousUser = await User.findOne({
            id: phone.anonymousKey,
            isAnonymous: true
        }, {relations: ['account', 'account.role']});
        if (user && user.registered) {
            throw new BadRequestException("user_active")
        } else {
            if (anonymousUser) {
                anonymousUser.isAnonymous = false;
                await this.registerUser(anonymousUser)
            } else if (user) {
                await this.registerUser(user)
            } else {
                user = new User();
                user.phone = phoneNumber;
                await this.registerUser(user)
            }
        }
    }

    async fillUserInformation(dto: UserInformationRequest): Promise<string> {
        let phoneNumber = dto.phonePrefix + dto.phone;
        let user = await User.findOne({phone: phoneNumber});
        if (user === null) {
            throw new NotFoundException('user_not_exists')
        }
        if (user.registered) {
            throw new BadRequestException("user_active")
        } else {
            user.email = dto.email;
            user.name = dto.name;
            user.registered = true;

            const card = new VirtualCard();
            card.ID = this.codeService.generateVirtualCardNumber();

            const details = new UserDetails();
            details.xp = 50;

            try {
                await getConnection().transaction(async entityManager => {
                    user.card = await entityManager.save(card);
                    user.details = await entityManager.save(details);
                    await entityManager.save(user);
                });
                return this.jwtService.signToken({id: user.id})
            } catch (e) {
                handleException(e, 'user', this.logger)
            }
        }

    }

    async checkCode(dto: CodeVerificationRequest) {
        let phoneNumber = dto.phonePrefix + dto.phone;
        let user = await User.findOne({phone: phoneNumber}, {
            join: {
                alias: 'user',
                leftJoin: {
                    'account': 'user.account',
                    'role': 'account.role'
                }
            }, where: {
                'user.account.role': RoleEnum.CLIENT
            }
        });
        if (!user) {
            throw new NotFoundException('invalid_code')
        }
    }

    private async registerUser(user: User) {
        let role = await Role.findOne({name: RoleEnum.CLIENT});
        if (!role) {
            throw new BadRequestException('user_not_created')
        }
        // await user.save().then(() => this.smsService.sendMessage(user.code, user.phone))
        try {
            let savedUser = await user.save();
            if (user.accounts) {
                let account = user.accounts.find(a => a.role == role);
                if (!account) {
                    let account = new Account();
                    account.role = role;
                    account.ID = this.codeService.generateUserNumber();
                    account.code = this.codeService.generateSmsCode();
                    account.user = savedUser;
                    await account.save();
                }
            } else {
                let account = new Account();
                account.role = role;
                account.ID = this.codeService.generateUserNumber();
                account.code = this.codeService.generateSmsCode();
                account.user = savedUser;
                await account.save();
            }
        } catch (e) {
            console.log(e);
            handleException(e, 'user', this.logger)
        }
    }
}
