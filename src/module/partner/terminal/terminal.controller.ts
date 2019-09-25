import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiImplicitBody, ApiImplicitHeader, ApiUseTags } from "@nestjs/swagger";
import { Const } from "../../../common/util/const";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleEnum } from "../../../common/enum/role.enum";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { createQueryBuilder, getConnection } from "typeorm";
import { PhoneRequest } from "../../../models/request/phone.request";
import { User } from "../../../database/entity/user.entity";
import { Role } from "../../../database/entity/role.entity";
import { Transaction } from "../../../database/entity/transaction.entity";
import { CodeService } from "../../../common/service/code.service";
import { TradingPoint } from "../../../database/entity/trading-point.entity";
import { Account } from "../../../database/entity/account.entity";
import { Terminal } from "../../../database/entity/terminal.entity";

@Controller()
@ApiUseTags('partner/terminal')
export class TerminalController {

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
        let terminals = await createQueryBuilder('Terminal', 'terminal')
            .leftJoinAndSelect('terminal.tradingPoint', 'tradingPoint')
            .andWhere('terminal.id != :id', {id: user.terminal.id})
            .getMany();
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
    @ApiImplicitBody({name: '', type: PhoneRequest})
    async assignNewTerminal(@Req() req: any, @Body() dto: PhoneRequest) {
        let phoneNumber = dto.phonePrefix + dto.phone;
        let point = await TradingPoint.findOne({id: req.user.terminal.tradingPoint.id});
        let user = await User.findOne({phone: phoneNumber}, {relations: ['terminal']});
        const role = await Role.findOne({name: RoleEnum.TERMINAL});

        if (!user) {
            user = new User();
            let account = new Account();
            account.role = role;
            let counts = await Terminal.count({tradingPoint: point});
            account.ID = [point.ID, this.codeService.generateTerminalNumber(counts)].join('-');
            let terminal = new Terminal();
            terminal.tradingPoint = point;
            await getConnection().transaction(async entityManager => {
                user.terminal = await entityManager.save(terminal);
                account.user = await entityManager.save(user);
                await entityManager.save(account);
            })
        } else {
            let terminal = new Terminal();
            terminal.tradingPoint = point;
            let account = new Account();
            account.role = role;
            await getConnection().transaction(async entityManager => {
                user.terminal = await entityManager.save(terminal);
                let counts = await Terminal.count({tradingPoint: point});
                account.ID = [point.ID, this.codeService.generateTerminalNumber(counts)].join('-');
                account.user = await entityManager.save(user);
                await entityManager.save(account);
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
        let transactions = await createQueryBuilder('Transaction')
            .leftJoinAndSelect('Transaction.user', 'user')
            .where('user.id = :id', {id: id})
            .getMany();
        if (transactions.length > 0) {
            transactions.forEach((t: any) => {
                t.user = null;
            });
            await getConnection().transaction(async entityManager => {
                await entityManager.save(transactions);
                await User.delete({id: id});
            })
        } else {
            await User.delete({id: id});
        }
    }
}
