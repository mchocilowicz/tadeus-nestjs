import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { Ngo } from "../../entity/ngo.entity";
import { ApiBearerAuth, ApiResponse, ApiUseTags } from "@nestjs/swagger";

import { Roles } from "../../common/decorators/roles.decorator";
import { RoleEnum } from "../../common/enum/role.enum";
import { VirtualCardDto } from "../../dto/virtual-card.dto";
import { MainDto } from "../../dto/main.dto";
import { ClientHistoryDto } from "../../dto/client-history.dto";
import { User } from "../../entity/user.entity";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";
import { RolesGuard } from "../../common/guards/roles.guard";

@Controller()
@ApiUseTags('client')
@ApiBearerAuth()
export class ClientController {

    @Get()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: MainDto})
    async mainScreen(@Req() req) {
        const user: User = req.user;
        const dto = new MainDto();
        dto.donationPool = user.donationPool;
        dto.ngo = user.ngo;
        dto.donationPool = user.donationPool;
        dto.collectedMoney = user.collectedMoney;
        dto.xp = user.xp;
        return dto
    }

    @Post('ngo')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async selectedNgo(@Req() req, @Body() ngo: Ngo) {
        let user: User = req.user;
        if(user.ngoSelectionCount > 2) {
            throw new BadRequestException("Could not add Ngo. Maximum Ngo selection reached.")
        }

        user.ngo = ngo;
        user.ngoSelectionCount++;

        try {
            await user.save()
        } catch (e) {
            throw new BadRequestException("Could not add Ngo. Please try again later.")
        }

    }

    @Get('history')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: ClientHistoryDto})
    history() {
        return [];
    }

    @Get('card')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: VirtualCardDto})
    virtualCard(@Req() req) {
        const card = new VirtualCardDto();
        let user: User = req.user;
        let virtualCard = user.virtualCard;

        card.cardNumber = virtualCard.cardNumber;
        card.code = virtualCard.code;

        return card;
    }
}
