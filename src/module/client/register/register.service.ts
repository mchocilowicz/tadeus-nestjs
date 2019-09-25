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
import { createQueryBuilder, getConnection } from "typeorm";
import { Account } from "../../../database/entity/account.entity";
import { UserDetails } from "../../../database/entity/user-details.entity";
import { VirtualCard } from "../../../database/entity/virtual-card.entity";
import { CryptoService } from "../../../common/service/crypto.service";


@Injectable()
export class RegisterService {
    private readonly logger = new Logger(RegisterService.name);

    constructor(private readonly jwtService: TadeusJwtService, private readonly codeService: CodeService, private readonly cryptoService: CryptoService) {
    }

    async createUser(phone: NewPhoneRequest): Promise<void> {
        let phoneNumber = phone.phonePrefix + phone.phone;

        let user: any = await createQueryBuilder('User', 'user')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .where('role.name = :name', {name: RoleEnum.CLIENT})
            .andWhere('user.phone = :phone', {phone: phoneNumber})
            .getOne();

        let anonymousUser: any = await createQueryBuilder('User', 'user')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .where('role.name = :name', {name: RoleEnum.CLIENT})
            .andWhere(`accounts.id = :id`, {id: this.cryptoService.decrypt(phone.anonymousKey)})
            .andWhere('user.isAnonymous = true')
            .getOne();
        if (user && user.registered) {
            throw new BadRequestException("user_active")
        } else {
            if (anonymousUser) {
                anonymousUser.isAnonymous = false;
                anonymousUser.phone = phoneNumber;
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
        let user: any = await createQueryBuilder('User', 'user')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .where('role.name = :name', {name: RoleEnum.CLIENT})
            .andWhere('user.phone = :phone', {phone: phoneNumber})
            .getOne();
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

            let account = user.accounts.find(a => a.role.name === RoleEnum.CLIENT);

            try {
                await getConnection().transaction(async entityManager => {
                    user.card = await entityManager.save(card);
                    user.details = await entityManager.save(details);
                    await entityManager.save(user);
                });
                let id = this.cryptoService.encryptId(account.id, RoleEnum.CLIENT);
                return this.jwtService.signToken({id: id})
            } catch (e) {
                handleException(e, 'user', this.logger)
            }
        }
    }

    async checkCode(dto: CodeVerificationRequest) {
        let phoneNumber = dto.phonePrefix + dto.phone;
        let user: any = await createQueryBuilder('User', 'user')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .where('role.name = :name', {name: RoleEnum.CLIENT})
            .andWhere('user.phone = :phone', {phone: phoneNumber})
            .getOne();
        if (!user) {
            throw new NotFoundException('invalid_code')
        }
        let account = user.accounts.find(a => a.role.name == RoleEnum.CLIENT);
        account.token = this.cryptoService.generateToken(account.id, account.code);
        await account.save()
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
