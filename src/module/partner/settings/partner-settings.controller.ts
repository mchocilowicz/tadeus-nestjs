import {Body, Controller, Get, Put, Req, UseGuards} from "@nestjs/common";
import {Terminal} from "../../../database/entity/terminal.entity";
import {TradingPoint} from "../../../database/entity/trading-point.entity";
import {ApiBearerAuth, ApiImplicitBody, ApiImplicitHeader, ApiUseTags} from "@nestjs/swagger";
import {Const} from "../../../common/util/const";
import {Roles} from "../../../common/decorators/roles.decorator";
import {RoleEnum} from "../../../common/enum/role.enum";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";
import {SettingsRequest} from "../../../models/partner/request/settings.request";

@Controller()
@ApiUseTags('settings')
@ApiBearerAuth()
export class PartnerSettingsController {

    @Get()
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
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getTradingPointSettings(@Req() req: any) {
        let terminal: Terminal = req.user;
        let point: TradingPoint = terminal.tradingPoint;

        return {
            defaultDonationPercent: point.donationPercentage,
            defaultReceipt: point.price,
        }
    }

    @Put()
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
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiImplicitBody({name: '', type: SettingsRequest})
    async updateTradingPointSettings(@Req() req: any, @Body() dto: SettingsRequest) {
        let terminal: Terminal = req.user;
        let point: TradingPoint = terminal.tradingPoint;

        point.donationPercentage = dto.defaultDonationPercent;
        point.price = dto.defaultReceipt;
        await point.save();
    }
}
