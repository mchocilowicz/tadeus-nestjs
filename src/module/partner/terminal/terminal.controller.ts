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
import { Step } from "../../../common/enum/status.enum";
import { CodeService } from "../../../common/service/code.service";

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
        let terminal = req.user;
        let terminals = await createQueryBuilder('User')
            .leftJoinAndSelect('User.tradingPoint', 'tradingPoint')
            .where('tradingPoint.id = :id', {id: terminal.tradingPoint.id})
            .andWhere('User.id != :userId', {userId: terminal.id})
            .getMany();
        return {
            phone: terminal.phone,
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
        let point = req.user.tradingPoint;
        let user = await User.findOne({phone: dto.phone});
        const role = await Role.findOne({name: RoleEnum.TERMINAL});
        if (user) {
            user.tradingPoint = point;
            user.roles.push(role);
        } else {
            user = new User();
            user.tradingPoint = point;
            user.ID = this.codeService.generateUserNumber();
            user.phone = dto.phone;
            user.roles = [role];
        }
        let terminalCount = await User.count({tradingPoint: point});
        let terminalID = [point.ID, this.codeService.generateTerminalNumber(terminalCount)].join('-');

        let transactionCount = await Transaction.count({terminalID: terminalID});
        while (transactionCount !== 0) {
            terminalCount += 1;
            terminalID = [point.ID, this.codeService.generateTerminalNumber(terminalCount)].join('-');
            transactionCount = await Transaction.count({terminalID: terminalID});
        }
        user.terminalID = terminalID;
        user.step = Step.SIGN_IN;
        await user.save();
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
