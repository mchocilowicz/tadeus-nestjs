import {Body, Controller, Delete, Get, Param, Post, Req, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiBody, ApiHeader, ApiTags} from "@nestjs/swagger";
import {Const} from "../../../common/util/const";
import {Roles} from "../../../common/decorators/roles.decorator";
import {RoleEnum} from "../../../common/enum/role.enum";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";
import {Terminal} from "../../../entity/terminal.entity";
import {TerminalRequest} from "../../../models/common/request/terminal.request";
import {TradingPoint} from "../../../entity/trading-point.entity";
import {TerminalService} from "../../common/terminal.service";

@Controller()
@ApiTags('terminal')
@ApiBearerAuth()
@ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
@ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
export class PartnerTerminalController {

    constructor(private readonly terminalService: TerminalService) {
    }

    @Get()
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getPartnerTerminals(@Req() req: any) {
        let terminal: Terminal = req.user;
        let point: TradingPoint = terminal.tradingPoint;

        return this.terminalService.getTerminalsForTradingPoint(terminal, point.id)
    }

    @Post()
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBody({type: TerminalRequest})
    async assignNewTerminal(@Req() req: any, @Body() dto: TerminalRequest) {
        await this.terminalService.addNewTerminalToTradingPoint(req.user.tradingPoint.id, dto)
    }

    @Delete(':id')
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async deleteTerminal(@Param('id') id: string) {
        await this.terminalService.deleteTerminal(id);
    }

}
