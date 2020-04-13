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
import {ApiBearerAuth, ApiBody, ApiHeader, ApiTags} from "@nestjs/swagger";
import {Const} from "../../../common/util/const";
import {Roles} from "../../../common/decorators/roles.decorator";
import {RoleEnum} from "../../../common/enum/role.enum";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";
import {EntityManager, getConnection} from "typeorm";
import {CodeService} from "../../../common/service/code.service";
import {Terminal} from "../../../entity/terminal.entity";
import {TerminalRequest} from "../../../models/common/request/terminal.request";
import {TradingPoint} from "../../../entity/trading-point.entity";
import {Phone} from "../../../entity/phone.entity";
import {Status} from "../../../common/enum/status.enum";
import {Account} from "../../../entity/account.entity";
import {Role} from "../../../entity/role.entity";
import {PhonePrefix} from "../../../entity/phone-prefix.entity";

@Controller()
@ApiTags('terminal')
@ApiBearerAuth()
@ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
@ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
export class PartnerTerminalController {

    private readonly logger = new Logger(PartnerTerminalController.name);

    constructor(private readonly codeService: CodeService) {
    }

    @Get()
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getPartnerTerminals(@Req() req: any) {
        let terminal: Terminal = req.user;
        let point: TradingPoint = terminal.tradingPoint;

        let terminals = await Terminal.findAllTerminals(point.id);

        return {
            phone: terminal.phone ? terminal.phone.value : null,
            terminals: terminals
                .filter((t: Terminal) => t.id !== terminal.id)
                .map((t: any) => {
                    return {
                        id: t.id,
                        phone: t.phone ? t.phone.value : null,
                        step: t.step
                    }
                })
        }

    }

    @Post()
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBody({type: TerminalRequest})
    async assignNewTerminal(@Req() req: any, @Body() dto: TerminalRequest) {
        let point = await TradingPoint.findOne({id: req.user.tradingPoint.id});

        if (!point) {
            this.logger.error(`Trading Point with id ${req.user.tradingPoint.id} does not exists`);
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
                    if (phone) {
                        await this.createTerminal(entityManager, phone, dto.name, point)
                    }
                })
            }
        } else {
            await getConnection().transaction(async entityManager => {
                let prefix = await PhonePrefix.findOne({value: dto.phonePrefix});
                if (!prefix) {
                    throw new NotFoundException(`Phone prefix ${dto.phonePrefix} is not supported or does not exists`);
                }
                let phone = new Phone(dto.phone, prefix);
                phone = await entityManager.save(phone);

                await this.createTerminal(entityManager, phone, dto.name, point)
            })
        }
    }

    @Delete(':id')
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async deleteTerminal(@Param('id') id: string) {
        let terminal: Terminal | undefined = await Terminal.createQueryBuilder('terminal')
            .leftJoinAndSelect('terminal.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoinAndSelect('terminal.transactions', 'transaction')
            .where('terminal.id = :id', {id: id})
            .andWhere('account.status = :status', {status: Status.ACTIVE})
            .getOne();

        if (!terminal) {
            throw new NotFoundException(`Terminal with id ${id} does not exists`)
        }

        await getConnection().transaction(async entityManager => {
            if (terminal) {
                terminal.name = '';
                terminal.phone = undefined;
                terminal.account.status = Status.DELETED;
                await entityManager.save(terminal);
                await entityManager.save(terminal.account);
            }
        })
    }

    private async createTerminal(entityManager: EntityManager, phone: Phone, name: string, tradingPoint ?: TradingPoint) {
        if (!tradingPoint) {
            this.logger.error(`Trading Point does not exists`);
            throw new NotFoundException('trading_point_does_not_exists')
        }

        let existingTerminal = await Terminal.findOne({
            tradingPoint: tradingPoint,
            phone: phone
        }, {relations: ['account']});
        if (existingTerminal) {
            existingTerminal.account.status = Status.ACTIVE;
            existingTerminal.name = name;
            await entityManager.save(existingTerminal);
        } else {
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
            terminal.isMain = false;
            await entityManager.save(terminal);
        }
    }
}
