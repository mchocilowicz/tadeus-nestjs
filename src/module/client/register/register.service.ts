import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { TadeusJwtService } from "../../common/TadeusJwtModule/TadeusJwtService";
import { CodeService } from "../../../common/service/code.service";
import { User } from "../../../database/entity/user.entity";
import { UserInformationRequest } from "../../../models/common/request/user-Information.request";
import { handleException } from "../../../common/util/functions";
import { CodeVerificationRequest } from "../../../models/common/request/code-verification.request";
import { RoleEnum } from "../../../common/enum/role.enum";
import { getConnection } from "typeorm";
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
        let user: User | undefined = await User.findUserByPhoneAndPrefix(dto.phone, dto.phonePrefix);

        if (!user) {
            throw new NotFoundException('user_not_exists')
        }
        if (user && user.registered) {
            throw new BadRequestException("user_active")
        }

        const account: Account = user.account;

        try {
            await getConnection().transaction(async entityManager => {
                if (user) {
                    user.setBasicInformation(dto.name, dto.email);
                    user.registered = true;
                    await entityManager.save(user);
                }
            });
        } catch (e) {
            handleException(e, 'user', this.logger)
        }

        if (!account) {
            this.logger.error(`User ${ user.id } does not have CLIENT account`);
            throw new BadRequestException('internal_server_error')
        }

        let id = this.cryptoService.encryptId(account.id, RoleEnum.CLIENT);
        return this.jwtService.signToken({id: id})

    }

    async checkCode(dto: CodeVerificationRequest) {
        let user: User | undefined = await User.findUserForVerification(dto.phone, dto.phonePrefix, dto.code);

        if (!user) {
            throw new NotFoundException('invalid_code')
        }
        let account = user.account;


        if (!account || !account.id || !account.code || account.role.value !== RoleEnum.CLIENT) {
            this.logger.error(`User ${ user.id } does not have CLIENT account`);
            throw new BadRequestException('internal_server_error');
        }

        account.token = this.cryptoService.generateToken(account.id, account.code);
        await account.save()
    }
}
