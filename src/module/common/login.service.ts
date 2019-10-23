import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CodeService } from "../../common/service/code.service";
import { User } from "../../database/entity/user.entity";
import { Role } from "../../database/entity/role.entity";
import { RoleEnum } from "../../common/enum/role.enum";
import { CodeVerificationRequest } from "../../models/request/code-verification.request";
import { PhoneRequest } from "../../models/request/phone.request";
import { Status, Step } from "../../common/enum/status.enum";
import { CryptoService } from "../../common/service/crypto.service";
import { createQueryBuilder, getConnection, getRepository } from "typeorm";
import { Account } from "../../database/entity/account.entity";
import { VirtualCard } from "../../database/entity/virtual-card.entity";
import { TadeusJwtService } from "./TadeusJwtModule/TadeusJwtService";
import { NewPhoneRequest } from "../../models/request/new-phone.request";
import { handleException } from "../../common/util/functions";

@Injectable()
export class LoginService {
    private readonly logger = new Logger(LoginService.name);

    constructor(private readonly jwtService: TadeusJwtService,
                private readonly codeService: CodeService,
                private readonly cryptoService: CryptoService) {
    }

    async createAnonymousUser(): Promise<string> {
        let user = new User();
        let role = await Role.findOne({name: RoleEnum.CLIENT});
        let account = new Account();
        user.isAnonymous = true;
        account.role = role;
        account.ID = this.codeService.generateUserNumber();

        const virtualCard = new VirtualCard();
        virtualCard.ID = this.codeService.generateVirtualCardNumber();

        try {
            let userId;
            await getConnection().transaction(async entityManager => {
                user.card = await entityManager.save(virtualCard);

                account.user = await entityManager.save(user);
                let savedAccount = await entityManager.save(account);
                savedAccount.token = this.cryptoService.generateToken(savedAccount.id, account.code);
                userId = this.cryptoService.encryptId(savedAccount.id, RoleEnum.CLIENT);
                await entityManager.save(savedAccount);
            });
            return this.jwtService.signToken({id: userId})
        } catch (e) {
            throw new BadRequestException("user_not_created")
        }
    }

    async checkTerminalCode(dto: CodeVerificationRequest): Promise<string> {
        let phoneNumber = dto.phonePrefix + dto.phone;
        let user: any = await this.getUser(phoneNumber, dto.code, RoleEnum.TERMINAL);

        if (!user) {
            throw new NotFoundException('invalid_code')
        }

        let account = user.accounts.find(a => a.role.name == RoleEnum.TERMINAL);
        account.token = this.cryptoService.generateToken(account.id, account.code);

        let id = this.cryptoService.encryptId(account.id, RoleEnum.TERMINAL);
        await account.save();
        return this.jwtService.signToken({id: id})
    }

    async checkDashboardCode(dto: CodeVerificationRequest): Promise<string> {
        let phoneNumber = dto.phonePrefix + dto.phone;
        let user: any = await this.getUser(phoneNumber, dto.code, RoleEnum.DASHBOARD);

        if (!user) {
            throw new NotFoundException('invalid_code')
        }

        let account = user.accounts.find(a => a.role.name == RoleEnum.DASHBOARD);
        account.token = this.cryptoService.generateToken(account.id, account.code);

        let id = this.cryptoService.encryptId(account.id, RoleEnum.DASHBOARD);
        await account.save();
        return this.jwtService.signToken({id: id})
    }

    async checkClientCode(dto: CodeVerificationRequest): Promise<string> {
        let phoneNumber = dto.phonePrefix + dto.phone;
        let user: any = await this.getUser(phoneNumber, dto.code, RoleEnum.CLIENT);

        if (!user) {
            throw new NotFoundException('invalid_code')
        }

        let account = user.accounts.find(a => a.role.name == RoleEnum.CLIENT);
        account.token = this.cryptoService.generateToken(account.id, account.code);

        let id = this.cryptoService.encryptId(account.id, RoleEnum.CLIENT);
        await account.save();
        return this.jwtService.signToken({id: id})
    }

    async signIn(phone: PhoneRequest, role: RoleEnum): Promise<void> {
        let phoneNumber = phone.phonePrefix + phone.phone;
        let user: any = await createQueryBuilder('User', 'user')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .where(`user.phone = :phone`, {phone: phoneNumber})
            .andWhere(`role.name = :role`, {role: role})
            .getOne();
        if (!user) {
            throw new NotFoundException('user_no_exists')
        }

        let account = user.accounts.find(a => a.role.name == role);
        this.checkUserRights(account, role);

        account.code = this.codeService.generateSmsCode();
        account.step = Step.CODE;
        // user.save().then(() => this.smsService.sendMessage(user.code, user.phone))
        await account.save()
    }

    async clientSignIn(dto: NewPhoneRequest): Promise<boolean> {
        let user: User = await getRepository(User).createQueryBuilder('user')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .where('role.name = :name', {name: RoleEnum.CLIENT})
            .andWhere('user.phone = :phone', {phone: dto.phone})
            .andWhere('user.phonePrefix = :prefix', {prefix: dto.phonePrefix})
            .getOne();

        let anonymousUser: User = await getRepository(User).createQueryBuilder('user')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .where('role.name = :name', {name: RoleEnum.CLIENT})
            .andWhere(`accounts.id = :id`, {id: this.cryptoService.decrypt(dto.anonymousKey)})
            .andWhere('user.isAnonymous = true')
            .getOne();

        if (user && user.registered) {
            let account = user.accounts.find(a => a.role.name == RoleEnum.CLIENT);
            this.checkUserRights(account, RoleEnum.CLIENT);
            account.code = this.codeService.generateSmsCode();
            await account.save();
            return true;
        } else {
            if (anonymousUser) {
                anonymousUser.isAnonymous = false;
                anonymousUser.phone = dto.phone;
                anonymousUser.phonePrefix = dto.phonePrefix;
                await this.registerUser(anonymousUser)
            } else if (user) {
                await this.registerUser(user)
            } else {
                user = new User();
                user.phone = dto.phone;
                user.phonePrefix = dto.phonePrefix;
                await this.registerUser(user)
            }
            return false;
        }
    }

    private async registerUser(user: User) {
        let role: Role = await Role.findOne({name: RoleEnum.CLIENT});
        if (!role) {
            throw new BadRequestException('user_not_created')
        }
        // await user.save().then(() => this.smsService.sendMessage(user.code, user.phone))
        try {
            if (user.accounts) {
                let account: Account = user.accounts.find(a => a.role == role);
                if (!account) {
                    let account = new Account();
                    account.role = role;
                    account.ID = this.codeService.generateUserNumber();
                    account.code = this.codeService.generateSmsCode();
                    account.user = user;
                    await account.save();
                }
            } else {
                let account = new Account();
                account.role = role;
                account.ID = this.codeService.generateUserNumber();
                account.code = this.codeService.generateSmsCode();
                account.user = await user.save();
                await account.save();
            }
        } catch (e) {
            console.log(e);
            handleException(e, 'user', this.logger)
        }
    }


    private checkUserRights(account: Account, role: RoleEnum) {
        if (!this.checkUserAccount(account, role)) {
            throw new UnauthorizedException('account_blocked')
        }
    }

    private checkUserAccount(account: Account, role: RoleEnum): boolean {
        return account.role.name === role && account.status === Status.ACTIVE
    }

    private getUser(phone: string, code: number, role: string): Promise<User> {
        return getRepository(User).createQueryBuilder('user')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .where(`user.phone = :phone`, {phone: phone})
            .andWhere(`accounts.code = :code`, {code: code})
            .andWhere(`role.name = :role`, {role: role})
            .getOne();
    }
}
