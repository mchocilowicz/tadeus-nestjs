import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiImplicitBody,
    ApiImplicitHeader,
    ApiImplicitQuery,
    ApiResponse,
    ApiUseTags
} from "@nestjs/swagger";
import { Const } from "../../common/util/const";
import { CodeVerificationRequest } from "../../models/request/code-verification.request";
import { PhoneRequest } from "../../models/request/phone.request";
import { RoleEnum } from "../../common/enum/role.enum";
import { LoginService } from "../common/login.service";
import { User } from "../../database/entity/user.entity";
import { createQueryBuilder } from "typeorm";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { PartnerDetailsResponse } from "../../models/response/partner-details.response";
import { TradingPoint } from "../../database/entity/trading-point.entity";
import { Role } from "../../database/entity/role.entity";
import { Transaction } from "../../database/entity/transaction.entity";
import { CodeService } from "../../common/service/code.service";
import { Step } from "../../common/enum/status.enum";

const _ = require('lodash');

@Controller()
@ApiUseTags('partner/auth',)
export class PartnerController {
    constructor(private readonly service: LoginService, private readonly codeService: CodeService) {
    }

    @Post('code')
    @ApiResponse({status: 200, type: 'string', description: 'Authorization token'})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: CodeVerificationRequest})
    verifyCode(@Body() dto: CodeVerificationRequest) {
        return this.service.checkVerificationCode(dto);
    }

    @Post('signIn')
    @ApiResponse({status: 200, type: null})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: PhoneRequest})
    async partnerSignIn(@Body() phone: PhoneRequest) {
        await this.service.signIn(phone, RoleEnum.TERMINAL);
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
    @ApiResponse({status: 200, type: PartnerDetailsResponse})
    async getPartnerData(@Req() req: any) {
        const user: User = req.user;
        const partner: any = await createQueryBuilder('TradingPoint')
            .leftJoinAndSelect('TradingPoint.city', 'city')
            .where('TradingPoint.id = :id', {id: user.tradingPoint.id})
            .andWhere('TradingPoint.active = true')
            .getOne();

        return {
            id: user.terminalID,
            name: partner.name,
            city: partner.city.name,
            address: partner.address,
            postCode: partner.postCode,
            xp: partner.xp
        }
    }

    @Get('history')
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
    @ApiImplicitQuery({name: 'terminal', type: "string", description: 'Terminal ID', required: false})
    async getPartnerHistory(@Req() req: any, @Query() query: { terminal: string }) {
        let point = req.user.tradingPoint;

        let sqlQuery = createQueryBuilder('Transaction')
            .leftJoinAndSelect('Transaction.tradingPoint', 'tradingPoint')
            .where('tradingPoint.id = :id', {id: point.id});

        if (query && query.terminal) {
            sqlQuery = sqlQuery.andWhere('Transaction.terminalID = :terminal', {terminal: query.terminal})
        }
        try {
            let transactions = await sqlQuery
                .orderBy('Transaction.createdAt', 'DESC')
                .getMany();
            const o = _.groupBy(transactions, 'createdAt');
            const chunkedKeys = _.chunk(Object.keys(o), 7);

            return chunkedKeys.map(key => _.flatten(key.map(k => o[k])))
        } catch (e) {
            console.log(e)
        }

    }

    @Get('terminal')
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
                    phone: t.phone,
                    step: t.step
                }
            })
        }

    }

    @Post('terminal')
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

}
