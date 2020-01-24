import { BadRequestException, Body, Controller, Logger, Post, Req, UseGuards } from "@nestjs/common";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleEnum } from "../../../common/enum/role.enum";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { ApiBearerAuth, ApiBody, ApiHeader, ApiTags } from "@nestjs/swagger";
import { Const } from "../../../common/util/const";
import { User } from "../../../database/entity/user.entity";
import { Phone } from "../../../database/entity/phone.entity";
import { getConnection } from "typeorm";
import { PayoutRequest } from "../../../models/client/request/payout.request";
import { UserPayout } from "../../../database/entity/user-payout.entity";

@Controller()
@ApiTags('payout')
@ApiBearerAuth()
@ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
@ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
export class PayoutController {

    private readonly logger = new Logger(PayoutController.name);

    @Post()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBody({type: PayoutRequest})
    async updateUserData(@Req() req: any, @Body() dto: PayoutRequest) {
        const user: User = req.user;
        const phone: Phone | undefined = user.phone;

        if (!phone) {
            this.logger.error(`User ${ user.id } does not have assigned Phone`);
            throw new BadRequestException('internal_server_error')
        }

        await getConnection().transaction(async entityManager => {
            let payout = new UserPayout(dto.name, dto.surName, dto.bankAccount, user);
            payout.price = user.card.personalPool;
            user.card.personalPool = 0;

            await entityManager.save(user.card);
            await entityManager.save(payout);
        });
    }

}
