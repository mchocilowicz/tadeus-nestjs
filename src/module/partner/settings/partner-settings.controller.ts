import {Body, Controller, Get, Put, Req, UseGuards} from "@nestjs/common";
import {Terminal} from "../../../entity/terminal.entity";
import {TradingPoint} from "../../../entity/trading-point.entity";
import {ApiBearerAuth, ApiBody, ApiHeader, ApiTags} from "@nestjs/swagger";
import {Const} from "../../../common/util/const";
import {Roles} from "../../../common/decorators/roles.decorator";
import {RoleEnum} from "../../../common/enum/role.enum";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";
import {SettingsRequest} from "../../../models/partner/request/settings.request";

@Controller()
@ApiTags('settings')
@ApiBearerAuth()
@ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
@ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
export class PartnerSettingsController {

    @Get()
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
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBody({type: SettingsRequest})
    async updateTradingPointSettings(@Req() req: any, @Body() dto: SettingsRequest) {
        let terminal: Terminal = req.user;
        let point: TradingPoint = terminal.tradingPoint;

        point.donationPercentage = dto.defaultDonationPercent;
        point.price = dto.defaultReceipt;
        await point.save();
    }
}
