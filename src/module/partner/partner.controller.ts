import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Logger,
    NotFoundException,
    Post,
    Query,
    Req,
    UseGuards
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiImplicitBody,
    ApiImplicitHeader,
    ApiImplicitQuery,
    ApiResponse,
    ApiUseTags
} from "@nestjs/swagger";
import { Const } from "../../common/util/const";
import { CodeVerificationRequest } from "../../models/common/request/code-verification.request";
import { PhoneRequest } from "../../models/common/request/phone.request";
import { RoleEnum } from "../../common/enum/role.enum";
import { LoginService } from "../common/login.service";
import { User } from "../../database/entity/user.entity";
import { createQueryBuilder } from "typeorm";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { PartnerDetailsResponse } from "../../models/common/response/partner-details.response";
import { TradingPoint } from "../../database/entity/trading-point.entity";
import { Transaction } from "../../database/entity/transaction.entity";
import { CodeService } from "../../common/service/code.service";
import { Terminal } from "../../database/entity/terminal.entity";
import { Account } from "../../database/entity/account.entity";
import { Period } from "../../database/entity/period.entity";
import { PartnerPayment } from "../../database/entity/partner-payment.entity";

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
        return this.service.checkCodeForTerminal(dto);
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
        await this.service.signInTerminal(phone);
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
        const terminal: Terminal = req.user;
        const account: Account = terminal.account;

        if (!terminal || !account) {
            this.logger.error(`Terminal or Accounts does not exists for ${ terminal.id }`);
            throw new BadRequestException('internal_server_error')
        }

        const partner: TradingPoint | undefined = await TradingPoint.findActivePointWithCityById(terminal.tradingPoint.id);

        if (!partner) {
            throw new NotFoundException('trading_point_does_not_exists')
        }

        let period = await Period.findCurrentPartnerPeriod();

        if (!period) {
            throw new BadRequestException('')
        }

        let payment: PartnerPayment | undefined = await PartnerPayment.findOne({period: period, tradingPoint: partner});
        let code = this.codeService.createCode(0, 99999) + '-' + this.codeService.createCode(0, 9999) + "-" + this.codeService.createCode(0, 99);

        return new PartnerDetailsResponse(account.ID, partner, code, period.to, payment)
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
            .leftJoinAndSelect('Transaction.terminal', 'terminal')
            .where('tradingPoint.id = :id', {id: point.id});

        if (query && query.terminal) {
            sqlQuery = sqlQuery.andWhere('terminal.ID = :terminal', {terminal: query.terminal})
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
    @ApiImplicitQuery({name: 'prefix', type: "number", description: 'Phone Prefix', required: false})
    @ApiImplicitQuery({name: 'phone', type: "number", description: 'Phone number', required: false})
    async verifyClient(@Query() query: { card: string, prefix: number, phone: number }) {
        let sqlQuery = User.createQueryBuilder('user')
            .leftJoinAndSelect('user.card', 'card')
            .leftJoinAndSelect('user.phone', 'phone')
            .leftJoinAndSelect('phone.prefix', 'prefix');

        if (query.card) {
            let user = await sqlQuery
                .where('card.code = :code', {code: query.card}).getOne();
            if (!user) {
                throw new BadRequestException('partner_bad_qr')
            }

            return user.name;
        } else if (query.prefix && query.phone) {
            let user = await sqlQuery
                .where('phone.value = :phone', {phone: query.phone})
                .andWhere('prefix.value = :prefix', {prefix: query.prefix})
                .getOne();

            if (!user) {
                throw new BadRequestException('partner_bad_phone')
            }

            return user.name;
        } else {
            throw new BadRequestException('user_no_exists')
        }
    }

}
