import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Logger,
    NotFoundException,
    Param,
    Post,
    Query,
    Req,
    UseGuards
} from "@nestjs/common";
import {CalculationService} from "../../../common/service/calculation.service";
import {CodeService} from "../../../common/service/code.service";
import {Roles} from "../../../common/decorators/roles.decorator";
import {RoleEnum} from "../../../common/enum/role.enum";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";
import {ApiBearerAuth, ApiBody, ApiHeader, ApiQuery, ApiResponse, ApiTags} from "@nestjs/swagger";
import {Const} from "../../../common/util/const";
import {Transaction} from "../../../database/entity/transaction.entity";
import {TransactionResponse} from "../../../models/common/response/transaction.response";
import {getConnection} from "typeorm";
import {CorrectionRequest, TransactionRequest} from "../../../models/partner/request/transaction.request";
import {handleException} from "../../../common/util/functions";
import {TradingPoint} from "../../../database/entity/trading-point.entity";
import {User} from "../../../database/entity/user.entity";
import {Terminal} from "../../../database/entity/terminal.entity";
import {Configuration} from "../../../database/entity/configuration.entity";
import {PartnerPayment} from "../../../database/entity/partner-payment.entity";
import {Period} from "../../../database/entity/period.entity";
import {Donation} from "../../../database/entity/donation.entity";
import {DonationEnum, PoolEnum} from "../../../common/enum/donation.enum";
import {PartnerTransactionResponse} from "../../../models/partner/response/partner-transaction.response";
import {FirebaseAdminService} from "../../../common/service/firebase-admin.service";
import {TransactionStatus} from "../../../common/enum/status.enum";

const moment = require('moment');

@Controller()
@ApiBearerAuth()
@ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
@ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
@ApiTags("transaction")
export class PartnerTransactionController {
    private readonly logger = new Logger(PartnerTransactionController.name);

    constructor(private readonly calService: CalculationService,
                private readonly codeService: CodeService,
                private readonly firebaseService: FirebaseAdminService) {
    }

    @Post('message')
    sendMessage(@Body() dto: { token: string }) {
        this.firebaseService.getAdmin().messaging().send({
            token: dto.token,
            data: {
                transactionID: "1",
                tradingPointName: "1",
                transactionDate: "1",
                prevAmount: "1",
                newAmount: "1",
                terminalID: "1"
            },
            notification: {
                title: 'Tadeus',
                body: 'Korekta transakcji do akceptacji',
            }
        })
            .then(() => this.logger.log("Notification send"))
            .catch((reason: any) => this.logger.error('Message not send. Reason: ' + reason));
    }

    @Post('correction')
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: TransactionResponse})
    @ApiBody({type: CorrectionRequest})
    async createCorrection(@Req() req: any, @Body() dto: CorrectionRequest) {
        let terminal: Terminal = req.user;
        let p = dto.price;

        const t: Transaction | undefined = await Transaction.createQueryBuilder('t')
            .leftJoinAndSelect('t.user', 'user')
            .leftJoinAndSelect('t.terminal', 'terminal')
            .leftJoinAndSelect('t.tradingPoint', 'point')
            .leftJoinAndSelect('user.account', 'account')
            .where('t.id = :id', {id: dto.transactionId})
            .getOne();

        if (!t) {
            throw new BadRequestException('transaction_does_not_exists')
        }

        if (t.status === TransactionStatus.CORRECTED) {
            throw new BadRequestException('transaction_corrected')
        }

        return await getConnection().transaction(async entityManager => {

            const config: Configuration | undefined = await Configuration.getMain();
            const period: Period | undefined = await Period.findCurrentPartnerPeriod();

            if (!config || !period) {
                this.logger.error('Configuration or Current Period is not available');
                throw new BadRequestException('internal_server_error');
            }

            let payment: PartnerPayment | undefined = await PartnerPayment.findOne({period: period});

            let tradingPoint: TradingPoint = terminal.tradingPoint;

            if (!payment) {
                payment = new PartnerPayment(this.codeService.generatePartnerPaymentID(), tradingPoint, period);
                payment = await entityManager.save(payment)
            }

            let user: User = t.user;

            let donation: Donation | undefined = await Donation.getCurrentDonationForUser(user, period);
            if (!donation) {
                donation = new Donation(
                    this.codeService.generateDonationID(),
                    DonationEnum.NGO,
                    PoolEnum.DONATION,
                    user,
                    period
                );
                donation = await entityManager.save(donation);
            }


            let transaction: Transaction = new Transaction(
                terminal,
                user,
                tradingPoint,
                this.codeService.generateTransactionID(),
                dto.price,
                payment,
                tradingPoint.vat,
                tradingPoint.fee,
                tradingPoint.donationPercentage,
                donation
            );

            const userXp = await this.calService.calculateXpForUser(user.id, user.xp, transaction);
            const tradingPointXp = await this.calService.calculateXpForPartner(tradingPoint.id, transaction);

            transaction.updateXpValues(userXp, tradingPointXp);
            tradingPoint.xp = tradingPointXp + Number(tradingPoint.xp);

            let pool = this.calService.calculateCost(dto.price, tradingPoint.donationPercentage, tradingPoint.vat);
            let provision = this.calService.calculateCost(dto.price, tradingPoint.fee, tradingPoint.vat);


            transaction.updatePaymentValues(provision, pool);
            transaction.setUserPool(pool / 2, pool / 2);

            if (!user.account.firebaseToken) {
                this.logger.error('Phone Firebase token does not exists');
                throw new BadRequestException('internal_server_error');
            }
            transaction.isCorrection = true;
            transaction.correction = t;

            await entityManager.save(transaction);

            this.firebaseService.getAdmin().messaging().send({
                token: user.account.firebaseToken,
                data: {
                    transactionID: t.ID,
                    tradingPointName: t.tradingPoint.name,
                    transactionDate: moment(t.createdAt).format(Const.DATE_FORMAT),
                    prevAmount: `${t.price}`,
                    newAmount: `${dto.price}`,
                    terminalID: t.terminal.ID
                },
                notification: {
                    title: 'Tadeus',
                    body: 'Korekta transakcji do akceptacji',
                }
            })
                .then(() => this.logger.log("Notification send"))
                .catch((reason: any) => this.logger.error('Message not send. Reason: ' + reason));

            if (terminal.isMain) {
                return {
                    oldPrice: t.price,
                    price: p,
                    a: t.poolValue,
                    // b: this.calService.calculateCost(p,)
                }
            } else {
                return {
                    oldPrice: t.price,
                    price: p,
                }
            }
        })
    }

    @Post()
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: TransactionResponse})
    @ApiBody({type: TransactionRequest})
    async saveTransaction(@Req() req: any, @Body() dto: TransactionRequest) {
        try {
            return await getConnection().transaction(async entityManager => {
                let terminal: Terminal = req.user;

                const config: Configuration | undefined = await Configuration.findOne({type: 'MAIN'});
                const period: Period | undefined = await Period.findCurrentPartnerPeriod();

                if (!config || !period) {
                    this.logger.error('Configuration or Current Period is not available');
                    throw new BadRequestException('internal_server_error');
                }

                if (!terminal) {
                    this.logger.error(`Terminal does not exists`);
                    throw new BadRequestException('internal_server_error');
                }

                let payment: PartnerPayment | undefined = await PartnerPayment.findOne({period: period});

                let tradingPoint: TradingPoint = terminal.tradingPoint;

                if (!payment) {
                    payment = new PartnerPayment(this.codeService.generatePartnerPaymentID(), tradingPoint, period);
                    payment = await entityManager.save(payment)
                }


                let user: User | undefined = await User.getUserForTransaction(dto.clientCode, dto.phonePrefix, dto.phone);

                if (!user) {
                    throw new BadRequestException('user_does_not_exists')
                }

                let donation: Donation | undefined = await Donation.getCurrentDonationForUser(user, period);
                if (!donation) {
                    donation = new Donation(
                        this.codeService.generateDonationID(),
                        DonationEnum.NGO,
                        PoolEnum.DONATION,
                        user,
                        period
                    );
                    donation = await entityManager.save(donation);
                }


                let transaction: Transaction = new Transaction(
                    terminal,
                    user,
                    tradingPoint,
                    this.codeService.generateTransactionID(),
                    dto.price,
                    payment,
                    tradingPoint.vat,
                    tradingPoint.fee,
                    tradingPoint.donationPercentage,
                    donation
                );

                const userXp = await this.calService.calculateXpForUser(user.id, user.xp, transaction);
                const tradingPointXp = await this.calService.calculateXpForPartner(tradingPoint.id, transaction);

                transaction.updateXpValues(userXp, tradingPointXp);
                tradingPoint.xp = tradingPointXp + Number(tradingPoint.xp);

                let pool = this.calService.calculateCost(dto.price, tradingPoint.donationPercentage, tradingPoint.vat);
                let provision = this.calService.calculateCost(dto.price, tradingPoint.fee, tradingPoint.vat);


                transaction.updatePaymentValues(provision, pool);
                transaction.setUserPool(pool / 2, pool / 2);

                if (!user.account.firebaseToken) {
                    this.logger.error('Phone Firebase token does not exists');
                    throw new BadRequestException('internal_server_error');
                }

                await entityManager.save(transaction);

                this.firebaseService.getAdmin().messaging().send({
                    token: user.account.firebaseToken,
                    data: {
                        transactionID: transaction.ID,
                        tradingPointName: tradingPoint.name,
                        transactionDate: moment().format(Const.DATE_FORMAT),
                        newAmount: `${dto.price}`,
                        terminalID: terminal.ID
                    },
                    notification: {
                        title: 'Tadeus',
                        body: 'Nowa transakcja do akceptacji',
                    }
                })
                    .then(() => this.logger.log("Notification send"))
                    .catch((reason: any) => this.logger.error('Message not send. Reason: ' + reason));


                if (terminal.isMain) {
                    return {
                        cardNumber: user.card.code,
                        price: dto.price,
                        donation: transaction.paymentValue,
                        transactionID: transaction.ID
                    }
                } else {
                    return {
                        cardNumber: user.card.code,
                        price: dto.price,
                        transactionID: transaction.ID
                    }
                }

            });
        } catch (e) {
            handleException(e, 'transaction', this.logger)
        }
    }

    @Get(':id/status')
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getTransactionStatus(@Param('id') id: string) {
        const t: Transaction | undefined = await Transaction.findOne({ID: id});
        if (!t) {
            throw new NotFoundException('transaction_does_not_exists')
        }
        return t.status
    }

    @Get()
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: PartnerTransactionResponse, isArray: true})
    @ApiQuery({name: 'prefix', type: "number", description: 'Phone prefix', required: false})
    @ApiQuery({name: 'phone', type: "number", description: 'Phone number', required: false})
    @ApiQuery({name: 'code', type: "string", description: 'User QR code', required: false})
    async getTransactionsToCorrection(@Req() req: any, @Query() query: { prefix: number, phone: number, code: string }) {
        if (query.prefix && query.phone) {
            let t: Transaction[] = await Transaction.createQueryBuilder('transaction')
                .leftJoin('transaction.user', 'user')
                .leftJoin('user.phone', 'phone')
                .leftJoin('phone.prefix', 'prefix')
                .where('phone.value = :phone', {phone: query.phone})
                .andWhere('prefix.value = :prefix', {prefix: query.prefix})
                .andWhere('transaction.isCorrection = false')
                .getMany();

            return this.mapTransactionToGetResponse(t);
        } else if (query.code) {
            let t: Transaction[] = await Transaction.createQueryBuilder('transaction')
                .leftJoin('transaction.user', 'user')
                .leftJoin('user.card', 'card')
                .where('card.code = :code', {code: query.code})
                .andWhere('transaction.isCorrection = false')
                .getMany();

            return this.mapTransactionToGetResponse(t);
        } else {
            let terminal: Terminal = req.user;
            let point: TradingPoint = terminal.tradingPoint;

            let t = await Transaction.createQueryBuilder('transaction')
                .leftJoin('transaction.tradingPoint', 'tradingPoint')
                .where('tradingPoint.id = :id', {id: point.id})
                .andWhere('transaction.isCorrection = false')
                .getMany();

            return this.mapTransactionToGetResponse(t);
        }
    }

    private mapTransactionToGetResponse(transactions: Transaction[]) {
        return transactions.map((t: Transaction) => new PartnerTransactionResponse(t.id, t.price, t.createdAt))
    }

}
