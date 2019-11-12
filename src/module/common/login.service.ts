import {BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {CodeService} from "../../common/service/code.service";
import {User} from "../../database/entity/user.entity";
import {Role} from "../../database/entity/role.entity";
import {RoleEnum} from "../../common/enum/role.enum";
import {CodeVerificationRequest} from "../../models/request/code-verification.request";
import {PhoneRequest} from "../../models/request/phone.request";
import {Status} from "../../common/enum/status.enum";
import {CryptoService} from "../../common/service/crypto.service";
import {getConnection} from "typeorm";
import {Account} from "../../database/entity/account.entity";
import {VirtualCard} from "../../database/entity/virtual-card.entity";
import {TadeusJwtService} from "./TadeusJwtModule/TadeusJwtService";
import {NewPhoneRequest} from "../../models/request/new-phone.request";
import {Phone} from "../../database/entity/phone.entity";
import {PhonePrefix} from "../../database/entity/phone-prefix.entity";
import {Terminal} from "../../database/entity/terminal.entity";

@Injectable()
export class LoginService {
    private readonly logger = new Logger(LoginService.name);

    constructor(private readonly jwtService: TadeusJwtService,
                private readonly codeService: CodeService,
                private readonly cryptoService: CryptoService) {
    }

    async createAnonymousUser(): Promise<string> {

        try {
            let userId = await getConnection().transaction(async entityManager => {
                let role = await Role.findOne({value: RoleEnum.CLIENT});

                if (!role) {
                    this.logger.error(`Role CLIENT does not exists`);
                    throw new BadRequestException('internal_server_error')
                }

                const virtualCard = new VirtualCard(this.codeService.generateVirtualCardNumber());

                let account = new Account(this.codeService.generateUserNumber(), role);
                account.code = 0;

                let savedAccount = await entityManager.save(account);
                let user = new User(savedAccount);
                user.card = await entityManager.save(virtualCard);
                await entityManager.save(user);

                if (!savedAccount.id || !savedAccount.code) {
                    this.logger.error(`Account not saved properly for User(Anonymous) ${user.id}`);
                    throw new BadRequestException('internal_server_error')
                }

                savedAccount.token = this.cryptoService.generateToken(savedAccount.id, account.code);
                await entityManager.save(savedAccount);
                return this.cryptoService.encryptId(savedAccount.id, RoleEnum.CLIENT);
            });

            return this.jwtService.signToken({id: userId})
        } catch (e) {
            throw new BadRequestException("user_not_created")
        }
    }

    async checkTerminalCode(dto: CodeVerificationRequest): Promise<string> {
        return this.checkCodeForRole(dto, RoleEnum.TERMINAL)
    }


    async checkDashboardCode(dto: CodeVerificationRequest): Promise<string> {
        return this.checkCodeForRole(dto, RoleEnum.DASHBOARD)
    }

    async checkClientCode(dto: CodeVerificationRequest): Promise<string> {
        return this.checkCodeForRole(dto, RoleEnum.CLIENT)
    }

    async signInTerminal(dto: PhoneRequest): Promise<void> {
        let terminal: Terminal | undefined = await Terminal.createQueryBuilder('terminal')
            .leftJoinAndSelect('terminal.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoin('terminal.phone', 'phone')
            .leftJoin('phone.prefix', 'prefix')
            .where(`phone.value = :phone`, {phone: dto.phone})
            .andWhere(`prefix.value = :prefix`, {prefix: dto.phonePrefix})
            .andWhere(`role.value = :role`, {role: RoleEnum.TERMINAL})
            .getOne();

        if (!terminal) {
            throw new NotFoundException('user_no_exists')
        }

        const account = terminal.account;

        if (!account) {
            this.logger.error(`Terminal ${terminal.id} does not have assigned Accounts`);
            throw new BadRequestException('internal_server_error')
        }

        this.checkUserRights(account, RoleEnum.TERMINAL);

        account.code = this.codeService.generateSmsCode();
        // user.save().then(() => this.smsService.sendMessage(user.code, user.phone))
        await account.save()

    }

    async signIn(dto: PhoneRequest, role: RoleEnum): Promise<void> {
        let user: User | undefined = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoin('user.phone', 'phone')
            .leftJoin('phone.prefix', 'prefix')
            .where(`phone.value = :phone`, {phone: dto.phone})
            .andWhere(`prefix.value = :prefix`, {prefix: dto.phonePrefix})
            .andWhere(`role.value = :role`, {role: role})
            .getOne();

        if (!user) {
            throw new NotFoundException('user_no_exists')
        }

        const account = user.account;

        if (!account) {
            this.logger.error(`User ${user.id} does not have assigned role CLIENT`);
            throw new BadRequestException('internal_server_error')
        }
        this.checkUserRights(account, role);

        account.code = this.codeService.generateSmsCode();
        // user.save().then(() => this.smsService.sendMessage(user.code, user.phone))
        await account.save()
    }

    async clientSignIn(dto: NewPhoneRequest): Promise<boolean> {
        let user: User | undefined = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoin('user.phone', 'phone')
            .leftJoin('phone.prefix', 'prefix')
            .where(`phone.value = :phone`, {phone: dto.phone})
            .andWhere(`prefix.value = :prefix`, {prefix: dto.phonePrefix})
            .andWhere('role.value = :name', {name: RoleEnum.CLIENT})
            .getOne();

        let anonymousUser: User | undefined = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .where('role.value = :name', {name: RoleEnum.CLIENT})
            .andWhere(`account.id = :id`, {id: this.cryptoService.decrypt(dto.anonymousKey)})
            .andWhere('user.isAnonymous = true')
            .getOne();

        let phone: Phone | undefined = await Phone.createQueryBuilder('phone')
            .leftJoin('phone.prefix', 'prefix')
            .where('phone.value = :phone', {phone: dto.phone})
            .andWhere('prefix.value = :prefix', {prefix: dto.phonePrefix})
            .getOne();

        return await getConnection().transaction(async entityManager => {
            if (!phone) {
                const prefix = await PhonePrefix.findOne({value: dto.phonePrefix});
                if (!prefix) {
                    this.logger.error(`Prefix ${dto.phonePrefix} is not in Database`);
                    throw new BadRequestException('internal_server_error')
                }
                phone = await entityManager.save(new Phone(dto.phone, prefix));
            }

            if (user && user.registered) {
                const account = user.account;

                if (!account || account.role.value !== RoleEnum.CLIENT) {
                    this.logger.error(`Account CLIENT does not exists for registered User ${user.id}`);
                    throw new BadRequestException('internal_server_error')
                }

                this.checkUserRights(account, RoleEnum.CLIENT);
                account.code = this.codeService.generateSmsCode();
                await entityManager.save(account);
                return true;
            } else {
                if (anonymousUser) {
                    anonymousUser.isAnonymous = false;
                    anonymousUser.phone = phone;
                    anonymousUser.account.code = this.codeService.generateSmsCode();
                    await entityManager.save(anonymousUser.account);
                    await entityManager.save(anonymousUser);
                } else if (user) {
                    user.account.code = this.codeService.generateSmsCode();
                    await entityManager.save(user.account);
                    await entityManager.save(user);
                } else {
                    let role = await Role.findOne({value: RoleEnum.CLIENT});

                    if (!role) {
                        this.logger.error(`Role CLIENT does not exists`);
                        throw new BadRequestException('internal_server_error')
                    }
                    let account = new Account(this.codeService.generateUserNumber(), role);
                    account = await entityManager.save(account);
                    user = new User(account, phone);
                    await entityManager.save(user);
                }
                return false;
            }
        });
    }

    private checkUserRights(account: Account, role: RoleEnum) {
        if (!this.checkUserAccount(account, role)) {
            throw new UnauthorizedException('account_blocked')
        }
    }

    private checkUserAccount(account: Account, role: RoleEnum): boolean {
        return account.role.value === role && account.status === Status.ACTIVE
    }

    async checkCodeForTerminal(request: CodeVerificationRequest): Promise<string> {
        let terminal: Terminal | undefined = await this.getTerminal(request, RoleEnum.TERMINAL);

        if (!terminal) {
            throw new NotFoundException('invalid_code')
        }

        let account = terminal.account;

        if (!account) {
            this.logger.error(`Terminal ${terminal.id} does not have any Accounts`);
            throw new BadRequestException('internal_server_error')
        }

        if (!account.code) {
            this.logger.error(`Code was not send for Terminal ${terminal.id}`);
            throw new BadRequestException('internal_server_error')
        }

        account.token = this.cryptoService.generateToken(account.id, account.code);

        await account.save();

        let id: string = this.cryptoService.encryptId(account.id, RoleEnum.TERMINAL);

        return this.jwtService.signToken({id: id})
    }

    private getTerminal(dto: CodeVerificationRequest, role: string): Promise<Terminal | undefined> {
        return Terminal.createQueryBuilder('terminal')
            .leftJoinAndSelect('terminal.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoinAndSelect('terminal.phone', 'phone')
            .leftJoinAndSelect('terminal.prefix', 'prefix')
            .where(`phone.value = :phone`, {phone: dto.phone})
            .where(`prefix.value = :prefix`, {prefix: dto.phonePrefix})
            .andWhere(`account.code = :code`, {code: dto.code})
            .andWhere(`role.value = :role`, {role: role})
            .getOne();
    }

    private async checkCodeForRole(request: CodeVerificationRequest, role: RoleEnum): Promise<string> {
        let user: User | undefined = await this.getUser(request, role);

        if (!user) {
            throw new NotFoundException('invalid_code')
        }

        if (role === RoleEnum.CLIENT && !user.registered) {
            throw new NotFoundException('user_does_not_exists');
        }

        return this.getTokenForUser(user, role)
    }

    private async getTokenForUser(user: User, role: RoleEnum): Promise<string> {
        const account = user.account;
        
        if (!account || !account.id || !account.code) {
            this.logger.error(`Account CLIENT for User ${user.id} does not exists`);
            throw new BadRequestException('internal_server_error')
        }

        account.token = this.cryptoService.generateToken(account.id, account.code);

        await account.save();

        let id: string = this.cryptoService.encryptId(account.id, role);

        return this.jwtService.signToken({id: id})
    }

    private getUser(dto: CodeVerificationRequest, role: string): Promise<User | undefined> {
        return User.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoinAndSelect('user.phone', 'phone')
            .leftJoinAndSelect('phone.prefix', 'prefix')
            .where(`phone.value = :phone`, {phone: dto.phone})
            .where(`prefix.value = :prefix`, {prefix: dto.phonePrefix})
            .andWhere(`account.code = :code`, {code: dto.code})
            .andWhere(`role.value = :role`, {role: role})
            .getOne();
    }
}
