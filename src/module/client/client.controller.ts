import { BadRequestException, Body, Controller, Get, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import { Ngo } from "../../database/entity/ngo.entity";
import { ApiBearerAuth, ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator";
import { RoleEnum } from "../../common/enum/role.enum";
import { User } from "../../database/entity/user.entity";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { createQueryBuilder } from "typeorm";
import { Const } from "../../common/util/const";
import { MainResponse } from "../../models/response/main.response";
import { ClientHistoryResponse } from "../../models/response/client-history.response";
import { VirtualCardResponse } from "../../models/response/virtual-card.response";

@Controller()
@ApiUseTags('client')
@ApiBearerAuth()
export class ClientController {

    @Get()
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
    @ApiResponse({status: 200, type: MainResponse})
    async mainScreen(@Req() req) {
        const user: User = req.user;
        const dto = new MainResponse();
        dto.donationPool = user.donationPool;
        dto.ngo = user.ngo;
        dto.donationPool = user.donationPool;
        dto.collectedMoney = user.collectedMoney;
        dto.xp = user.xp;
        dto.name = user.name;
        return dto
    }

    @Post('ngo')
    @HttpCode(200)
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
    async selectedNgo(@Req() req, @Body() ngo: Ngo) {
        let user: User = req.user;
        if (user.ngoSelectionCount > 2) {
            throw new BadRequestException("user_ngo_max_reached")
        }
        user.ngo = ngo;
        user.ngoSelectionCount++;
        try {
            await user.save()
        } catch (e) {
            throw new BadRequestException("ngo_not_assigned")
        }

    }

    @Get('history')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: ClientHistoryResponse})
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
    async history(@Req() req) {
        const user: User = req.user;

        let tempUser: User = await createQueryBuilder("User")
            .where("id = :id", {id: user.id})
            .leftJoinAndSelect("User.transactions", "transactions")
            .leftJoinAndSelect("User.donations", "donations").execute();

        return {
            transactions: tempUser.transactions,
            donations: tempUser.donations
        }
    }

    @Get('card')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: VirtualCardResponse})
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
    virtualCard(@Req() req) {
        const card = new VirtualCardResponse();
        let user: User = req.user;
        let virtualCard = user.virtualCard;

        card.cardNumber = virtualCard.cardNumber;
        card.code = virtualCard.code;

        return card;
    }
}
