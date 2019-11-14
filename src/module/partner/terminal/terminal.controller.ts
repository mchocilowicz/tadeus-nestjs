import {
    BadGatewayException,
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    NotFoundException,
    Param,
    Post,
    Req,
    UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiImplicitBody, ApiImplicitHeader, ApiUseTags } from "@nestjs/swagger";
import { Const } from "../../../common/util/const";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleEnum } from "../../../common/enum/role.enum";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { EntityManager, getConnection } from "typeorm";
import { CodeService } from "../../../common/service/code.service";
import { Terminal } from "../../../database/entity/terminal.entity";
import { TerminalRequest } from "../../../models/common/request/terminal.request";
import { TradingPoint } from "../../../database/entity/trading-point.entity";
import { Phone } from "../../../database/entity/phone.entity";
import { Status } from "../../../common/enum/status.enum";
import { Account } from "../../../database/entity/account.entity";
import { Role } from "../../../database/entity/role.entity";
import { PhonePrefix } from "../../../database/entity/phone-prefix.entity";

@Controller()
@ApiUseTags('terminal')
export class TerminalController {

    private readonly logger = new Logger(TerminalController.name);

    constructor(private readonly codeService: CodeService) {
    }

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
    @ApiBearerAuth()
    async getPartnerTerminals(@Req() req: any) {
        let user = req.user;

        let terminals = await Terminal.findAllWithoutCurrentTerminal(user.id);

        return {
            phone: user.phone,
            terminals: terminals.map((t: any) => {
                return {
                    id: t.id,
                    phone: t.phone,
                    step: t.step
                }
            })
        }

    }

    @Post()
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
    @ApiBearerAuth()
    @ApiImplicitBody({name: '', type: TerminalRequest})
    async assignNewTerminal(@Req() req: any, @Body() dto: TerminalRequest) {
        let point = await TradingPoint.findOne({id: req.user.tradingPoint.id});

        if (!point) {
            this.logger.error(`Trading Point with id ${ req.user.tradingPoint.id } does not exists`);
            throw new NotFoundException('trading_point_does_not_exists')
        }

        let phone = await Phone.findNumber(dto.phonePrefix, dto.phone);
        if (phone) {
            let terminal: Terminal | undefined = await Terminal.createQueryBuilder('terminal')
                .leftJoinAndSelect('terminal.account', 'account')
                .leftJoinAndSelect('terminal.phone', 'phone')
                .leftJoinAndSelect('phone.prefix', 'prefix')
                .leftJoinAndSelect('account.role', 'role')
                .where('phone.value = :phone', {phone: dto.phone})
                .andWhere('prefix.value = :prefix', {prefix: dto.phonePrefix})
                .getOne();

            if (terminal) {
                const account = terminal.account;
                if (account.status === Status.ACTIVE) {
                    throw new BadGatewayException('terminal_active_in_other_trading_point')
                }
            } else {
                await getConnection().transaction(async entityManager => {
                    if (terminal && phone) {
                        this.createTerminal(entityManager, phone, dto.name, point)
                    }
                })
            }
        } else {
            await getConnection().transaction(async entityManager => {
                let prefix = await PhonePrefix.findOne({value: dto.phonePrefix});
                if (!prefix) {
                    throw new NotFoundException(`Phone prefix ${ dto.phonePrefix } is not supported or does not exists`);
                }
                let phone = new Phone(dto.phone, prefix);
                phone = await entityManager.save(phone);

                this.createTerminal(entityManager, phone, dto.name, point)
            })
        }
    }

    @Delete(':id')
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
    @ApiBearerAuth()
    async deleteTerminal(@Param('id') id: string) {
        let terminal: Terminal | undefined = await Terminal.createQueryBuilder('terminal')
            .leftJoinAndSelect('terminal.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoinAndSelect('terminal.transactions', 'transaction')
            .leftJoinAndSelect('terminal.corrections', 'correction')
            .where('terminal.id = :id', {id: id})
            .where('account.status = :status', {status: Status.ACTIVE})
            .getOne();

        if (!terminal) {
            throw new NotFoundException(`Terminal with id ${ id } does not exists`)
        }

        await getConnection().transaction(async entityManager => {
            if (terminal) {
                let transactions = terminal.transactions ? terminal.transactions : [];
                let corrections = terminal.corrections ? terminal.corrections : [];

                if (transactions.length > 0 || corrections.length > 0) {
                    terminal.name = '';
                    terminal.phone = undefined;
                    await entityManager.save(terminal);
                } else {
                    await entityManager.remove(terminal);
                    await entityManager.remove(terminal.account)
                }

            }
        })
    }

    private async createTerminal(entityManager: EntityManager, phone: Phone, name: string, tradingPoint ?: TradingPoint) {
        if (!tradingPoint) {
            this.logger.error(`Trading Point does not exists`);
            throw new NotFoundException('trading_point_does_not_exists')
        }

        let counts = await Terminal.count({tradingPoint: tradingPoint});
        let role = await Role.findOne({value: RoleEnum.TERMINAL});
        if (!role) {
            throw new NotFoundException('Role TERMINAL does not exists in DB');
        }
        const id = [tradingPoint.ID, this.codeService.generateTerminalNumber(counts)].join('-');

        let terminalAccount = new Account(id, role);

        let terminal = new Terminal(
            id,
            phone,
            tradingPoint,
            await entityManager.save(terminalAccount),
            name
        );
        await entityManager.save(terminal);

    }
}
