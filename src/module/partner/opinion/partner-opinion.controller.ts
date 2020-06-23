import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiHeader, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleType } from "../../../common/enum/roleType";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Const } from "../../../common/util/const";
import { NotificationRequest } from "../../../models/client/request/notification.request";
import { Opinion } from "../../../entity/opinion.entity";
import { TradingPoint } from "../../../entity/trading-point.entity";
import { Terminal } from "../../../entity/terminal.entity";

@Controller() @ApiBearerAuth() @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER) @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER) @ApiTags('opinion')
export class PartnerOpinionController {

    @Get() @Roles(RoleType.TERMINAL) @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: "string", description: 'User email'})
    async getEmailForOption(@Req() req: any) {
        let terminal: Terminal = req.user;
        let point: TradingPoint = terminal.tradingPoint;

        return point.email;
    }

    @Post() @Roles(RoleType.TERMINAL) @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBody({type: NotificationRequest})
    async createOpinion(@Req() req: any, @Body() dto: NotificationRequest) {
        let opinion = new Opinion(dto.value, dto.email, undefined, req.user.tradingPoint);
        await opinion.save();
    }

}
