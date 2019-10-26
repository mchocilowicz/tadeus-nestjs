import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { TadeusJwtService } from "../../common/TadeusJwtModule/TadeusJwtService";
import { CodeService } from "../../../common/service/code.service";
import { User } from "../../../database/entity/user.entity";
import { UserInformationRequest } from "../../../models/request/user-Information.request";
import { handleException } from "../../../common/util/functions";
import { CodeVerificationRequest } from "../../../models/request/code-verification.request";
import { RoleEnum } from "../../../common/enum/role.enum";
import { getConnection } from "typeorm";
import { UserDetails } from "../../../database/entity/user-details.entity";
import { VirtualCard } from "../../../database/entity/virtual-card.entity";
import { CryptoService } from "../../../common/service/crypto.service";
import { Account } from "../../../database/entity/account.entity";


@Injectable()
export class RegisterService {
    private readonly logger = new Logger(RegisterService.name);

    constructor(private readonly jwtService: TadeusJwtService,
                private readonly codeService: CodeService,
                private readonly cryptoService: CryptoService) {
    }

    async fillUserInformation(dto: UserInformationRequest): Promise<string> {
        let user: User | undefined = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .leftJoinAndSelect('user.details', 'details')
            .leftJoin('user.phone', 'phone')
            .leftJoin('phone.prefix', 'prefix')
            .where('role.name = :name', {name: RoleEnum.CLIENT})
            .andWhere('phone.value = :phone', {phone: dto.phone})
            .andWhere('prefix.value = :prefix', {prefix: dto.phonePrefix})
            .getOne();

        if (!user) {
            throw new NotFoundException('user_not_exists')
        }
        if (user && user.registered) {
            throw new BadRequestException("user_active")
        }

        const card: VirtualCard = new VirtualCard(this.codeService.generateVirtualCardNumber());
        const details: UserDetails = new UserDetails(dto.name, dto.email, 50);

        const accounts: Account[] | undefined = user.accounts;

        if (!accounts) {
            this.logger.error(`User ${user.id} does not have any created accounts`);
            throw new BadRequestException('internal_server_error')
        }

        let account: Account | undefined = accounts.find(a => a.role.value === RoleEnum.CLIENT);

        if (!account) {
            this.logger.error(`User ${user.id} does not have CLIENT account`);
            throw new BadRequestException('internal_server_error');
        }

        try {
            await getConnection().transaction(async entityManager => {
                if (user) {
                    user.card = await entityManager.save(card);
                    user.details = await entityManager.save(details);
                    user.registered = true;
                    await entityManager.save(user);
                }
            });
        } catch (e) {
            handleException(e, 'user', this.logger)
        }

        if (!account.id) {
            this.logger.error(`User ${user.id} does not have CLIENT account`);
            throw new BadRequestException('internal_server_error')
        }

        let id = this.cryptoService.encryptId(account.id, RoleEnum.CLIENT);
        return this.jwtService.signToken({id: id})

    }

    async checkCode(dto: CodeVerificationRequest) {
        let user: User | undefined = await User.createQueryBuilder('user')
            .leftJoin('user.phone', 'phone')
            .leftJoin('phone.prefix', 'prefix')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .where('role.name = :name', {name: RoleEnum.CLIENT})
            .andWhere('phone.value = :phone', {phone: dto.phone})
            .andWhere('prefix.value = :prefix', {prefix: dto.phonePrefix})
            .getOne();

        if (!user) {
            throw new NotFoundException('invalid_code')
        }

        if (!user.accounts) {
            this.logger.error(`User ${user.id} does not have any created accounts`);
            throw new BadRequestException('internal_server_error')
        }

        let account: Account | undefined = user.accounts.find(a => a.role.value === RoleEnum.CLIENT);

        if (!account || !account.id || !account.code) {
            this.logger.error(`User ${user.id} does not have CLIENT account`);
            throw new BadRequestException('internal_error');
        }

        account.token = this.cryptoService.generateToken(account.id, account.code);
        await account.save()
    }
}
