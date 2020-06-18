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
import { ApiBearerAuth, ApiBody, ApiHeader, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Const } from "../../common/util/const";
import { CodeVerificationRequest } from "../../models/common/request/code-verification.request";
import { PhoneRequest } from "../../models/common/request/phone.request";
import { RoleEnum } from "../../common/enum/role.enum";
import { LoginService } from "../common/login.service";
import { User } from "../../entity/user.entity";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { PartnerDetailsResponse } from "../../models/common/response/partner-details.response";
import { TradingPoint } from "../../entity/trading-point.entity";
import { Transaction } from "../../entity/transaction.entity";
import { CodeService } from "../../common/service/code.service";
import { Terminal } from "../../entity/terminal.entity";
import { Account } from "../../entity/account.entity";
import { PartnerPayment } from "../../entity/partner-payment.entity";
import { PartnerVerifyQuery } from "../../models/partner/partner-verify.query";
import { PartnerVerifyResponse } from "../../models/partner/response/partner-verify.response";
import { TransactionStatus } from "../../common/enum/status.enum";

const moment = require('moment');

@Controller()
@ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
export class PartnerController {
    private readonly logger = new Logger(PartnerController.name);

    constructor(private readonly service: LoginService, private readonly codeService: CodeService) {
    }

    @Post('code')
    @ApiResponse({status: 200, type: 'string', description: 'Authorization token'})
    @ApiTags('auth')
    @ApiBody({type: CodeVerificationRequest})
    verifyCode(@Body() dto: CodeVerificationRequest) {
        return this.service.checkCodeForTerminal(dto);
    }

    @Post('signIn')
    @ApiResponse({status: 200})
    @ApiTags('auth')
    @ApiBody({type: PhoneRequest})
    async partnerSignIn(@Body() phone: PhoneRequest) {
        await this.service.signInTerminal(phone);
    }

    @Get()
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiTags('partner')
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

        let payments: PartnerPayment[] = await PartnerPayment.findAllNotPaidPayments(partner.id);

        let hasPayments: boolean = payments.length > 0;
        const paymentPrice: number = payments.reduce((p, c) => p + c.price, 0);
        let paymentAt = undefined;
        if (hasPayments) {
            paymentAt = payments[0].paymentAt
        }

        return new PartnerDetailsResponse(account.ID, partner, hasPayments, partner.price, paymentPrice, paymentAt)
    }

    @Get('history')
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiTags('partner')
    @ApiQuery({name: 'terminal', type: "string", description: 'Terminal ID', required: false})
    async getPartnerHistory(@Req() req: any, @Query() query: { terminal: string }) {
        let point = req.user.tradingPoint;

        let sqlQuery = Transaction.createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.tradingPoint', 'tradingPoint')
            .leftJoinAndSelect('transaction.terminal', 'terminal')
            .where('tradingPoint.id = :id', {id: point.id})
            .andWhere('transaction.status = :status', {status: TransactionStatus.ACCEPTED});

        if (query && query.terminal) {
            sqlQuery = sqlQuery.andWhere('terminal.ID = :terminal', {terminal: query.terminal})
        }
        try {
            let transactions = await sqlQuery
                .orderBy('transaction.createdAt', 'DESC')
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
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiTags('partner')
    @ApiQuery({name: 'card', type: "string", description: 'Card code', required: false})
    @ApiQuery({name: 'prefix', type: "number", description: 'Phone Prefix', required: false})
    @ApiQuery({name: 'phone', type: "number", description: 'Phone number', required: false})
    @ApiResponse({status: 200, type: PartnerVerifyResponse})
    async verifyClient(@Query() query: PartnerVerifyQuery) {
        let sqlQuery = User.createQueryBuilder('user')
            .leftJoinAndSelect('user.card', 'card')
            .leftJoinAndSelect('user.phone', 'phone')
            .leftJoinAndSelect('phone.prefix', 'prefix');

        if (query.card) {
            let user = await sqlQuery
                .where('card.code = :code', {code: query.card})
                .getOne();

            if (!user) {
                throw new BadRequestException('partner_bad_qr')
            }

            return new PartnerVerifyResponse(user.card.code, user.name)
        } else if (query.prefix && query.phone) {
            let user = await sqlQuery
                .where('phone.value = :phone', {phone: query.phone})
                .andWhere('prefix.value = :prefix', {prefix: query.prefix})
                .getOne();

            if (!user) {
                throw new BadRequestException('partner_bad_phone')
            }

            return new PartnerVerifyResponse(user.card.code, user.name)
        } else {
            throw new BadRequestException('user_no_exists')
        }
    }

}
