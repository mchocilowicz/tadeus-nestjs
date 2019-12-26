import { BadRequestException, Body, Controller, Logger, Post, Req, UseGuards } from "@nestjs/common";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleEnum } from "../../../common/enum/role.enum";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { ApiImplicitBody, ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { Const } from "../../../common/util/const";
import { User } from "../../../database/entity/user.entity";
import { Phone } from "../../../database/entity/phone.entity";
import { getConnection } from "typeorm";
import { PayoutRequest } from "../../../models/client/request/payout.request";
import { UserPayout } from "../../../database/entity/user-payment.entity";

@Controller()
@ApiUseTags('payout')
export class PayoutController {

    private readonly logger = new Logger(PayoutController.name);

    @Post()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitHeader({
        name: Const.HEADER_AUTHORIZATION,
        required: true,
        description: Const.HEADER_AUTHORIZATION_DESC
    })
    @ApiImplicitBody({name: '', type: PayoutRequest})
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
