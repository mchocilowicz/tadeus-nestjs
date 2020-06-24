import {
    BadRequestException, Body, Controller, Get, Logger, NotFoundException, Post, Query, Req, UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiHeader, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Const } from "../../../common/util/const";
import { CodeVerificationRequest } from "../../../models/common/request/code-verification.request";
import { PhoneRequest } from "../../../models/common/request/phone.request";
import { RoleType } from "../../../common/enum/roleType";
import { LoginService } from "../../common/login.service";
import { User } from "../../../entity/user.entity";
import { Roles } from "../../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { PartnerDetailsResponse } from "../../../models/common/response/partner-details.response";
import { TradingPoint } from "../../../entity/trading-point.entity";
import { Transaction } from "../../../entity/transaction.entity";
import { CodeService } from "../../../common/service/code.service";
import { Terminal } from "../../../entity/terminal.entity";
import { Account } from "../../../entity/account.entity";
import { PartnerPayment } from "../../../entity/partner-payment.entity";
import { PartnerVerifyQuery } from "../../../models/partner/partner-verify.query";
import { PartnerVerifyResponse } from "../../../models/partner/response/partner-verify.response";
import { TransactionHistoryResponse } from "../../../models/partner/transaction-history.response";

const moment = require('moment');

@Controller() @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
export class PartnerRootController {
    private readonly logger = new Logger(PartnerRootController.name);

    constructor(private readonly service: LoginService, private readonly codeService: CodeService) {
    }

    @Post('code') @ApiResponse({
        status: 200,
        type: 'string',
        description: 'Authorization token'
    }) @ApiTags('auth') @ApiBody({ type: CodeVerificationRequest }) verifyCode(@Body() dto: CodeVerificationRequest) {
        return this.service.checkCodeForTerminal(dto);
    }

    @Post('signIn')
    @ApiResponse({status: 200})
    @ApiTags('auth')
    @ApiBody({type: PhoneRequest})
    async partnerSignIn(@Body() phone: PhoneRequest) {
        await this.service.signInTerminal(phone);
    }

    @Get() @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER) @Roles(RoleType.TERMINAL) @UseGuards(JwtAuthGuard, RolesGuard)
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

    @Get('history') @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER) @Roles(RoleType.TERMINAL) @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiTags('partner')
    @ApiQuery({name: 'terminal', type: "string", description: 'Terminal ID', required: false})
    async getPartnerHistory(@Req() req: any, @Query() query: { terminal: string }) {
        let point = req.user.tradingPoint;

        let sqlQuery = Transaction.createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.tradingPoint', 'tradingPoint')
            .leftJoinAndSelect('transaction.terminal', 'terminal')
            .leftJoinAndSelect('transaction.correction', 'correction')
            .where('tradingPoint.id = :id', {id: point.id});

        if (query && query.terminal) {
            sqlQuery = sqlQuery.andWhere('terminal.ID = :terminal', {terminal: query.terminal})
        }
        try {
            let transactions = await sqlQuery
                .orderBy('transaction.createdAt', 'DESC')
                .getMany();

            if (transactions.length > 0) {
                return this.extractDataForWeeks(transactions);
            }
            return [];
        } catch (e) {
            console.log(e)
        }
    }

    groupDates(data: { createdAt: Date }[], token: string): Map<string, { createdAt: Date }[]> {
        const groupedMap = data.reduce(function (val: Map<string, { createdAt: Date }[]>, obj: { createdAt: Date }) {
            let comp = moment(obj.createdAt).format(token);
            const value = val.get(comp);
            if (value) {
                value.push(obj);
            } else {
                val.set(comp, [obj])
            }
            return val;
        }, new Map<string, []>());
        return groupedMap;
    }

    private extractDataForWeeks(transactions: Transaction[]) {
        let years = this.groupDates(transactions, 'Y');
        let allweeks: any = [];

        let sortedYear = [...years.keys()].sort((a, b) => a > b ? -1 : 1);

        for (const year of sortedYear) {
            const data = years.get(year) as Transaction[];
            if (data) {
                this.extractedDataByFormat(data, allweeks, 'W', 'isoWeek');
            }
        }
        return allweeks
    }

    private extractedDataByFormat(data: Transaction[], allweeks: any[], format: string, format2: string): void {
        let groupedData = this.groupDates(data, format);
        let sortedData = [...groupedData.keys()].sort((a, b) => a > b ? -1 : 1);

        sortedData.forEach(value => {
            let period = groupedData.get(value)
            if (period) {
                allweeks.push({
                    week: this.prepareDate(period[0].createdAt, format2),
                    list: period.map(e => new TransactionHistoryResponse(e as Transaction))
                })
            }
        })
    }

    private prepareDate(date: Date, format: string): string {
        return `${moment(date).startOf(format).format(Const.DATE_FORMAT)} - ${moment(date).endOf(format).format(Const.DATE_FORMAT)}`;
    }

    @Get('verify') @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER) @Roles(RoleType.TERMINAL) @UseGuards(JwtAuthGuard, RolesGuard)
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
