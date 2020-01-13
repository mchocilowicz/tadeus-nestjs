import { BadRequestException, Body, Controller, Get, Logger, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CalculationService } from "../../../common/service/calculation.service";
import { CodeService } from "../../../common/service/code.service";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleEnum } from "../../../common/enum/role.enum";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { ApiBearerAuth, ApiBody, ApiHeader, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Const } from "../../../common/util/const";
import { Transaction } from "../../../database/entity/transaction.entity";
import { TransactionResponse } from "../../../models/common/response/transaction.response";
import { getConnection } from "typeorm";
import { CorrectionRequest, TransactionRequest } from "../../../models/partner/request/transaction.request";
import { handleException } from "../../../common/util/functions";
import { VirtualCard } from "../../../database/entity/virtual-card.entity";
import { TradingPoint } from "../../../database/entity/trading-point.entity";
import { User } from "../../../database/entity/user.entity";
import { Terminal } from "../../../database/entity/terminal.entity";
import { Configuration } from "../../../database/entity/configuration.entity";
import { PartnerPayment } from "../../../database/entity/partner-payment.entity";
import { Period } from "../../../database/entity/period.entity";
import { Donation } from "../../../database/entity/donation.entity";
import { DonationEnum, PoolEnum } from "../../../common/enum/donation.enum";
import { PartnerTransactionResponse } from "../../../models/partner/response/partner-transaction.response";
import { FirebaseAdminService } from "../../../common/service/firebase-admin.service";

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
    async createCorrection(@Req() req: any, @Body() request: CorrectionRequest) {
        let terminal: Terminal = req.user;
        let p = request.price;

        const t: Transaction | undefined = await Transaction.createQueryBuilder('t')
            .leftJoinAndSelect('t.user', 'user')
            .leftJoinAndSelect('t.terminal', 'terminal')
            .leftJoinAndSelect('t.tradingPoint', 'point')
            .leftJoinAndSelect('user.account', 'account')
            .where('t.id = :id', {id: request.transactionId})
            .getOne();

        if (!t) {
            throw new BadRequestException('transaction_does_not_exists')
        }

        if (t.isCorrection) {
            throw new BadRequestException('transaction_corrected')
        }

        if (!t.user.account.firebaseToken) {
            this.logger.error('Phone Firebase token does not exists');
            throw new BadRequestException('internal_server_error');
        }

        this.firebaseService.getAdmin().messaging().send({
            token: t.user.account.firebaseToken,
            data: {
                transactionID: t.ID,
                tradingPointName: t.tradingPoint.name,
                transactionDate: moment(t.createdAt).format(Const.DATE_FORMAT),
                prevAmount: `${ t.price }`,
                newAmount: `${ request.price }`,
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

                if (!user || !user.card) {
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


                const virtualCard: VirtualCard = user.card;

                user.xp += userXp;

                let pool = this.calService.calculateCost(dto.price, tradingPoint.donationPercentage, tradingPoint.vat);
                let provision = this.calService.calculateCost(dto.price, tradingPoint.fee, tradingPoint.vat);

                transaction.updatePaymentValues(provision, pool);
                payment.price += Number(provision + pool);

                virtualCard.updatePool(pool);
                transaction.setUserPool(virtualCard.personalPool, virtualCard.donationPool);
                user.updateCollectedMoney(pool);

                await entityManager.save(transaction);

                if (user.ngo) {
                    let card = user.ngo.card;
                    if (!card) {
                        this.logger.error(`Physical Card is not assigned to Ngo ${ user.ngo.id }`);
                        throw new BadRequestException('internal_server_error');
                    }
                    card.collectedMoney += pool;
                    await entityManager.save(card)
                } else {
                    user.ngoTempMoney += pool;
                }

                await entityManager.save(virtualCard);
                await entityManager.save(payment);
                await entityManager.save(tradingPoint);
                await entityManager.save(user);


                if (terminal.isMain) {
                    return {
                        cardNumber: user.card.code,
                        price: dto.price,
                        donation: transaction.paymentValue
                    }
                } else {
                    return {
                        cardNumber: user.card.code,
                        price: dto.price,
                    }
                }

            });
        } catch (e) {
            handleException(e, 'transaction', this.logger)
        }
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
