import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CodeService } from "../../common/service/code.service";
import { User } from "../../entity/user.entity";
import { Role } from "../../entity/role.entity";
import { RoleType } from "../../common/enum/roleType";
import { CodeVerificationRequest } from "../../models/common/request/code-verification.request";
import { PhoneRequest } from "../../models/common/request/phone.request";
import { Status, Step } from "../../common/enum/status.enum";
import { CryptoService } from "../../common/service/crypto.service";
import { EntityManager, getConnection } from "typeorm";
import { Account } from "../../entity/account.entity";
import { VirtualCard } from "../../entity/virtual-card.entity";
import { TadeusJwtService } from "./TadeusJwtModule/TadeusJwtService";
import { NewPhoneRequest } from "../../models/common/request/new-phone.request";
import { Phone } from "../../entity/phone.entity";
import { PhonePrefix } from "../../entity/phone-prefix.entity";
import { Terminal } from "../../entity/terminal.entity";
import { Admin } from "../../entity/admin.entity";
import { SmsService } from "./sms.service";

@Injectable()
export class LoginService {
    private readonly logger = new Logger(LoginService.name);

    constructor(private readonly jwtService: TadeusJwtService, private readonly codeService: CodeService, private readonly cryptoService: CryptoService, private readonly smsService: SmsService) {
    }

    async createAnonymousUser(): Promise<string> {

        try {
            let userId = await getConnection().transaction(async entityManager => {
                let role = await Role.findOne({ value: RoleType.CLIENT });

                if (!role) {
                    this.logger.error(`Role CLIENT does not exists`);
                    throw new BadRequestException('internal_server_error')
                }

                const virtualCard = new VirtualCard(this.codeService.generateVirtualCardNumber());

                let account = new Account(this.codeService.generateUserNumber(), role);
                account.code = 9999;

                let savedAccount = await entityManager.save(account);
                let card = await entityManager.save(virtualCard);
                let user = new User(card, savedAccount);
                user.isAnonymous = true;

                await entityManager.save(user);

                if (!savedAccount.id || !savedAccount.code) {
                    this.logger.error(`Account not saved properly for User(Anonymous) ${user.id}`);
                    throw new BadRequestException('internal_server_error')
                }

                savedAccount.token = this.cryptoService.generateToken(savedAccount.id, account.code);
                await entityManager.save(savedAccount);
                return this.cryptoService.encryptId(savedAccount.id, RoleType.CLIENT);
            });

            return this.jwtService.signToken({id: userId})
        } catch (e) {
            throw new BadRequestException("user_not_created")
        }
    }

    async signInTerminal(dto: PhoneRequest): Promise<void> {
        let terminal: Terminal | undefined = await Terminal.createQueryBuilder('terminal')
                                                           .leftJoinAndSelect('terminal.account', 'account')
                                                           .leftJoinAndSelect('account.role', 'role')
                                                           .leftJoinAndSelect('terminal.phone', 'phone')
                                                           .leftJoin('phone.prefix', 'prefix')
                                                           .where(`phone.value = :phone`, { phone: dto.phone })
                                                           .andWhere(`prefix.value = :prefix`, { prefix: dto.phonePrefix })
                                                           .andWhere(`role.value = :role`, { role: RoleType.TERMINAL })
                                                           .getOne();

        await this.signInEntity(terminal, RoleType.TERMINAL)
    }

    async signInDashboard(dto: PhoneRequest): Promise<void> {
        let admin: Admin | undefined = await Admin.createQueryBuilder('a')
                                                  .leftJoinAndSelect('a.account', 'account')
                                                  .leftJoinAndSelect('account.role', 'role')
                                                  .leftJoinAndSelect('a.phone', 'phone')
                                                  .leftJoin('phone.prefix', 'prefix')
                                                  .where(`phone.value = :phone`, { phone: dto.phone })
                                                  .andWhere(`prefix.value = :prefix`, { prefix: dto.phonePrefix })
                                                  .andWhere(`role.value = :role`, { role: RoleType.DASHBOARD })
                                                  .andWhere('account.status = :status', {status: Status.ACTIVE})
                                                  .getOne();

        await this.signInEntity(admin, RoleType.DASHBOARD)
    }

    async clientSignIn(dto: NewPhoneRequest): Promise<boolean> {
        let user: User | undefined = await User.createQueryBuilder('user')
                                               .leftJoinAndSelect('user.account', 'account')
                                               .leftJoinAndSelect('account.role', 'role')
                                               .leftJoin('user.phone', 'phone')
                                               .leftJoin('phone.prefix', 'prefix')
                                               .where(`phone.value = :phone`, { phone: dto.phone })
                                               .andWhere(`prefix.value = :prefix`, { prefix: dto.phonePrefix })
                                               .andWhere('role.value = :name', { name: RoleType.CLIENT })
                                               .andWhere('account.status <> :status', {status: Status.DELETED})
                                               .getOne();

        let anonymousUser: User | undefined = await User.createQueryBuilder('user')
                                                        .leftJoinAndSelect('user.account', 'account')
                                                        .leftJoinAndSelect('account.role', 'role')
                                                        .where('role.value = :name', { name: RoleType.CLIENT })
                                                        .andWhere(`account.id = :id`, {id: this.cryptoService.decrypt(dto.anonymousKey)})
                                                        .andWhere('user.isAnonymous = true')
                                                        .getOne();

        let phone: Phone | undefined = await Phone.createQueryBuilder('phone')
            .leftJoin('phone.prefix', 'prefix')
            .where('phone.value = :phone', {phone: dto.phone})
            .andWhere('prefix.value = :prefix', {prefix: dto.phonePrefix})
            .getOne();

        const smsCode = this.codeService.generateSmsCode();

        const userExists = await getConnection().transaction(async entityManager => {
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

                if (!account || account.role.value !== RoleType.CLIENT) {
                    this.logger.error(`Account CLIENT does not exists for registered User ${ user.id }`);
                    throw new BadRequestException('internal_server_error')
                }

                if (account && (account.status === Status.SUSPENDED || account.status === Status.BLOCKED)) {
                    this.logger.error(`Account CLIENT is Suspended or Blocked for User ${user.id}`);
                    throw new BadRequestException('account_blocked')
                }

                this.checkUserRights(account, RoleType.CLIENT);
                account.code = smsCode;
                await entityManager.save(account);
                return true;
            } else {
                if (anonymousUser) {
                    anonymousUser.isAnonymous = false;
                    anonymousUser.phone = phone;
                    anonymousUser.account.code = smsCode;
                    await entityManager.save(anonymousUser.account);
                    await entityManager.save(anonymousUser);
                } else if (user) {
                    user.account.code = smsCode;
                    await entityManager.save(user.account);
                    await entityManager.save(user);
                } else {
                    let role = await Role.findOne({ value: RoleType.CLIENT });

                    if (!role) {
                        this.logger.error(`Role CLIENT does not exists`);
                        throw new BadRequestException('internal_server_error')
                    }

                    let account = new Account(this.codeService.generateUserNumber(), role);
                    let card: VirtualCard = new VirtualCard(this.codeService.generateVirtualCardNumber());

                    account.code = smsCode;

                    account = await entityManager.save(account);
                    card = await entityManager.save(card);
                    user = new User(card, account, phone);

                    await entityManager.save(user);
                }
                return false;
            }
        });

        await this.smsService.sendMessage(smsCode, dto.phone);

        return userExists;
    }

    async checkCodeForDashboard(request: CodeVerificationRequest): Promise<string> {
        let admin: Admin | undefined = await Admin.createQueryBuilder('admin')
                                                  .leftJoinAndSelect('admin.account', 'account')
                                                  .leftJoinAndSelect('account.role', 'role')
                                                  .leftJoinAndSelect('admin.phone', 'phone')
                                                  .leftJoinAndSelect('phone.prefix', 'prefix')
                                                  .where(`phone.value = :phone`, { phone: request.phone })
                                                  .where(`prefix.value = :prefix`, { prefix: request.phonePrefix })
                                                  .andWhere(`account.code = :code`, { code: request.code })
                                                  .andWhere(`role.value = :role`, { role: RoleType.DASHBOARD })
                                                  .getOne();

        if (!admin) {
            throw new NotFoundException('invalid_code')
        }
        return await getConnection().transaction(async entityManager => {
            return this.getTokenForEntity(entityManager, admin, RoleType.DASHBOARD)
        })
    }

    async checkCodeForTerminal(request: CodeVerificationRequest): Promise<object> {
        let terminal: Terminal | undefined = await this.getTerminal(request, RoleType.TERMINAL);

        if (!terminal) {
            throw new NotFoundException('invalid_code')
        }

        return {
            token: await getConnection().transaction(async entityManager => {
                if (!terminal) {
                    throw new NotFoundException('invalid_code')
                }

                terminal.step = Step.ACTIVE;
                await entityManager.save(terminal);

                return await this.getTokenForEntity(entityManager, terminal, RoleType.TERMINAL)
            }),
            mainTerminal: terminal.isMain
        }
    }

    async checkCodeForUser(request: CodeVerificationRequest): Promise<string> {
        let user: User | undefined = await this.getUser(request, RoleType.CLIENT);

        if (!user) {
            throw new NotFoundException('user_does_not_exists')
        }

        if (!user.registered) {
            throw new NotFoundException('user_does_not_exists');
        }

        return await getConnection().transaction(async entityManager => {
            return this.getTokenForEntity(entityManager, user, RoleType.CLIENT)
        })
    }

    private async getTokenForEntity(entityManager: EntityManager, entity: any, role: RoleType): Promise<string> {
        const account = entity.account;

        if (!account || !account.code) {
            this.logger.error(`Account ${ role } for  ${ entity.id } does not exists`);
            throw new BadRequestException('internal_server_error')
        }

        account.token = this.cryptoService.generateToken(account.id, account.code);

        await entityManager.save(account);

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
            .andWhere(`prefix.value = :prefix`, {prefix: dto.phonePrefix})
            .andWhere(`account.code = :code`, {code: dto.code})
            .andWhere(`role.value = :role`, {role: role})
            .andWhere('account.status = :status', {status: Status.ACTIVE})
            .getOne();
    }

    private getTerminal(dto: CodeVerificationRequest, role: string): Promise<Terminal | undefined> {
        return Terminal.createQueryBuilder('terminal')
            .leftJoinAndSelect('terminal.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoinAndSelect('terminal.phone', 'phone')
            .leftJoinAndSelect('phone.prefix', 'prefix')
            .where('phone.value = :phone', {phone: dto.phone})
            .andWhere('prefix.value = :prefix', {prefix: dto.phonePrefix})
            .andWhere('account.code = :code', {code: dto.code})
            .andWhere('role.value = :role', {role: role})
            .andWhere('account.status = :status', {status: Status.ACTIVE})
            .getOne();
    }

    private checkUserRights(account: Account, role: RoleType) {
        if (!this.checkUserAccount(account, role)) {
            throw new UnauthorizedException('account_blocked')
        }
    }

    private checkUserAccount(account: Account, role: RoleType): boolean {
        return account.role.value === role && account.status === Status.ACTIVE
    }

    private async signInEntity(entity: any, role: RoleType) {
        if (!entity) {
            throw new NotFoundException('user_does_not_exists')
        }

        const account = entity.account;

        if (!account) {
            this.logger.error(`${ entity.id } does not have assigned Account ${ role }`);
            throw new BadRequestException('internal_server_error')
        }

        this.checkUserRights(account, role);

        await getConnection().transaction(async entityManager => {
            if (account.role.value === RoleType.TERMINAL) {
                entity.step = Step.CODE;
                await entityManager.save(entity)
            }

            account.code = this.codeService.generateSmsCode();
            await entityManager.save(account);
            await this.smsService.sendMessage(account.code, entity.phone.value);
        })
    }

}
