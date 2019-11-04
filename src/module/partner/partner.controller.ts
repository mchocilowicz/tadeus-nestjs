import {BadRequestException, Body, Controller, Get, Logger, Post, Query, Req, UseGuards} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiImplicitBody,
    ApiImplicitHeader,
    ApiImplicitQuery,
    ApiResponse,
    ApiUseTags
} from "@nestjs/swagger";
import {Const} from "../../common/util/const";
import {CodeVerificationRequest} from "../../models/request/code-verification.request";
import {PhoneRequest} from "../../models/request/phone.request";
import {RoleEnum} from "../../common/enum/role.enum";
import {LoginService} from "../common/login.service";
import {User} from "../../database/entity/user.entity";
import {createQueryBuilder} from "typeorm";
import {Roles} from "../../common/decorators/roles.decorator";
import {JwtAuthGuard} from "../../common/guards/jwt.guard";
import {RolesGuard} from "../../common/guards/roles.guard";
import {PartnerDetailsResponse} from "../../models/response/partner-details.response";
import {TradingPoint} from "../../database/entity/trading-point.entity";
import {Transaction} from "../../database/entity/transaction.entity";
import {CodeService} from "../../common/service/code.service";
import {Terminal} from "../../database/entity/terminal.entity";
import {Account} from "../../database/entity/account.entity";

const moment = require('moment');

@Controller()
export class PartnerController {
    private readonly logger = new Logger(PartnerController.name);

    constructor(private readonly service: LoginService, private readonly codeService: CodeService) {
    }

    @Post('code')
    @ApiResponse({status: 200, type: 'string', description: 'Authorization token'})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiUseTags('auth')
    @ApiImplicitBody({name: '', type: CodeVerificationRequest})
    verifyCode(@Body() dto: CodeVerificationRequest) {
        return this.service.checkTerminalCode(dto);
    }

    @Post('signIn')
    @ApiResponse({status: 200, type: null})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiUseTags('auth')
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
    @ApiUseTags('partner')
    @ApiResponse({status: 200, type: PartnerDetailsResponse})
    async getPartnerData(@Req() req: any) {
        const user: User = req.user;
        const terminal: Terminal | undefined = user.terminal;
        const accounts: Account[] | undefined = user.accounts;

        if (!terminal || !accounts) {
            this.logger.error(`Terminal or Accounts does not exists for User(Terminal) ${user.id}`);
            throw new BadRequestException('internal_server_error')
        }

        const partner: TradingPoint | undefined = await TradingPoint.findActivePointWithCityById(terminal.tradingPoint.id);

        const terminalAccount: Account | undefined = accounts.find(a => a.role.value === RoleEnum.TERMINAL);

        if (!terminalAccount || !partner) {
            this.logger.error(`Partner or Terminal Role does not exists for User(Terminal) ${user.id}`);
            throw new BadRequestException('internal_server_error')
        }


        return new PartnerDetailsResponse(terminalAccount.ID, partner)
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
    @ApiUseTags('partner')
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
            let d = [];
            if (transactions.length > 0) {
                let lastTransaction: any = transactions[transactions.length - 1];
                const lastDate = moment(lastTransaction.createdAt);
                const lastMonday = lastDate.weekday(-6);
                let end = moment();
                let start = moment().weekday(1);

                while (start.isSameOrAfter(lastMonday)) {
                    const from = start.format(Const.DATE_FORMAT);
                    const to = end.format(Const.DATE_FORMAT);

                    let t = transactions.filter((e: any) => moment(moment(e.createdAt).format(Const.DATE_FORMAT)).isBetween(from, to, null, '[]'));
                    if (t.length > 0) {
                        d.push(t);
                    }
                    start = moment(to).subtract(1, "days").weekday(-6);
                    end = moment(from).subtract(1, 'days');
                }
            }
            return d;
        } catch (e) {
            console.log(e)
        }

    }

    @Get('verify')
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
    @ApiUseTags('partner')
    @ApiImplicitQuery({name: 'card', type: "string", description: 'Card code', required: false})
    @ApiImplicitQuery({name: 'phone', type: "string", description: 'Phone number', required: false})
    async verifyClient(@Query() query: { card: string, phone: string }) {
        let sqlQuery = createQueryBuilder('User', 'user');

        if (query.card) {
            let user = await sqlQuery
                .leftJoinAndSelect('user.card', 'card')
                .where('card.code = :code', {code: query.card}).getOne();
            if (!user) {
                throw new BadRequestException('partner_bad_qr')
            }
        } else if (query.phone) {
            let user = sqlQuery
                .where('user.phone = :phone', {phone: query.phone})
                .getOne();
            if (!user) {
                throw new BadRequestException('partner_bad_phone')
            }
        } else {
            throw new BadRequestException('user_no_exists')
        }
    }

}
