import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { TadeusJwtService } from "./TadeusJwtModule/TadeusJwtService";
import { CodeService } from "../../common/service/code.service";
import { User } from "../../database/entity/user.entity";
import { Role } from "../../database/entity/role.entity";
import { RoleEnum } from "../../common/enum/role.enum";
import { CodeVerificationRequest } from "../../models/request/code-verification.request";
import { PhoneRequest } from "../../models/request/phone.request";
import { Status, Step } from "../../common/enum/status.enum";
import { CryptoService } from "../../common/service/crypto.service";
import { createQueryBuilder, getConnection } from "typeorm";
import { Account } from "../../database/entity/account.entity";
import { VirtualCard } from "../../database/entity/virtual-card.entity";

@Injectable()
export class LoginService {
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
                let savedUser = await entityManager.save(user);

                account.token = this.cryptoService.generateToken(savedUser.id, account.code);
                account.user = savedUser;
                await entityManager.save(account);
                userId = this.cryptoService.encryptId(savedUser.id);

                await entityManager.save(savedUser);
            });
            return this.jwtService.signToken({id: userId})
        } catch (e) {
            throw new BadRequestException("user_not_created")
        }
    }

    async checkTerminalCode(dto: CodeVerificationRequest): Promise<string> {
        let phoneNumber = dto.phonePrefix + dto.phone;
        let user: any = this.getUser(phoneNumber, dto.code, RoleEnum.TERMINAL);

        if (!user) {
            throw new NotFoundException('invalid_code')
        }

        let account = user.accounts.find(a => a.role.name == RoleEnum.TERMINAL);
        account.token = this.cryptoService.generateToken(account.id, account.code);

        let id = this.cryptoService.encryptId(account.id);
        await account.save();
        return this.jwtService.signToken({id: id})
    }

    async checkDashboardCode(dto: CodeVerificationRequest): Promise<string> {
        let phoneNumber = dto.phonePrefix + dto.phone;
        let user: any = this.getUser(phoneNumber, dto.code, RoleEnum.DASHBOARD);

        if (!user) {
            throw new NotFoundException('invalid_code')
        }

        let account = user.accounts.find(a => a.role.name == RoleEnum.TERMINAL);
        account.token = this.cryptoService.generateToken(account.id, account.code);

        let id = this.cryptoService.encryptId(account.id);
        await account.save();
        return this.jwtService.signToken({id: id})
    }

    async checkClientCode(dto: CodeVerificationRequest): Promise<string> {
        let phoneNumber = dto.phonePrefix + dto.phone;
        let user: any = this.getUser(phoneNumber, dto.code, RoleEnum.CLIENT);

        if (!user) {
            throw new NotFoundException('invalid_code')
        }

        let account = user.accounts.find(a => a.role.name == RoleEnum.TERMINAL);
        account.token = this.cryptoService.generateToken(account.id, account.code);

        let id = this.cryptoService.encryptId(account.id);
        await account.save();
        return this.jwtService.signToken({id: id})
    }

    async signIn(phone: PhoneRequest, role: RoleEnum): Promise<void> {
        let phoneNumber = phone.phonePrefix + phone.phone;
        let user: any = await createQueryBuilder('User', 'user')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .where(`user.phone = ${phoneNumber}`)
            .andWhere(`role.name = ${role}`)
            .getOne();
        if (!user) {
            throw new NotFoundException('user_no_exists')
        }
        this.checkUserRights(user, role);

        let account = user.accounts.find(a => a.role.name == role);

        account.code = this.codeService.generateSmsCode();
        account.step = Step.CODE;
        // user.save().then(() => this.smsService.sendMessage(user.code, user.phone))
        await account.save()
    }

    private checkUserRights(user: User, role: RoleEnum) {
        if (!this.checkUserAccount(user.accounts, role)) {
            throw new UnauthorizedException('account_blocked')
        }
    }

    private checkUserAccount(userRoles: Account[], role: RoleEnum): boolean {
        return userRoles.some(r => r.role.name === role && r.status !== Status.ACTIVE)
    }

    private async getUser(phone: String, code: number, role: string) {
        return await createQueryBuilder('User', 'user')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .where(`user.phone = ${phone}`)
            .andWhere(`account.code = ${code}`)
            .andWhere(`role.name = ${role}`)
            .getOne();
    }
}
