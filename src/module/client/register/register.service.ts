import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { TadeusJwtService } from "../../common/TadeusJwtModule/TadeusJwtService";
import { CodeService } from "../../../common/service/code.service";
import { User } from "../../../database/entity/user.entity";
import { UserInformationRequest } from "../../../models/request/user-Information.request";
import { handleException } from "../../../common/util/functions";
import { CodeVerificationRequest } from "../../../models/request/code-verification.request";
import { RoleEnum } from "../../../common/enum/role.enum";
import { getConnection, getRepository } from "typeorm";
import { UserDetails } from "../../../database/entity/user-details.entity";
import { VirtualCard } from "../../../database/entity/virtual-card.entity";
import { CryptoService } from "../../../common/service/crypto.service";


@Injectable()
export class RegisterService {
    private readonly logger = new Logger(RegisterService.name);

    constructor(private readonly jwtService: TadeusJwtService,
                private readonly codeService: CodeService,
                private readonly cryptoService: CryptoService) {
    }

    async fillUserInformation(dto: UserInformationRequest): Promise<string> {
        let user: User = await getRepository(User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .leftJoinAndSelect('user.details', 'details')
            .where('role.name = :name', {name: RoleEnum.CLIENT})
            .andWhere('user.phone = :phone', {phone: dto.phone})
            .andWhere('user.phonePrefix = :prefix', {prefix: dto.phonePrefix})
            .getOne();
        if (user === null) {
            throw new NotFoundException('user_not_exists')
        }
        if (user.registered) {
            throw new BadRequestException("user_active")
        } else {
            user.email = dto.email;
            user.registered = true;

            const card = new VirtualCard();
            card.ID = this.codeService.generateVirtualCardNumber();

            const details = new UserDetails();
            details.name = dto.name;
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
        let user: User = await getRepository(User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.accounts', 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .where('role.name = :name', {name: RoleEnum.CLIENT})
            .andWhere('user.phone = :phone', {phone: dto.phone})
            .andWhere('user.phonePrefix = :prefix', {prefix: dto.phonePrefix})
            .getOne();
        if (!user) {
            throw new NotFoundException('invalid_code')
        }
        let account = user.accounts.find(a => a.role.name == RoleEnum.CLIENT);
        account.token = this.cryptoService.generateToken(account.id, account.code);
        await account.save()
    }
}
