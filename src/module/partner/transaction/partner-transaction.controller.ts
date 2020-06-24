import {
    BadRequestException,
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    Param,
    Post,
    Query,
    Req,
    UseGuards
} from "@nestjs/common";
import { CalculationService } from "../../../common/service/calculation.service";
import { CodeService } from "../../../common/service/code.service";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleType } from "../../../common/enum/roleType";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { ApiBearerAuth, ApiBody, ApiHeader, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Const } from "../../../common/util/const";
import { Transaction } from "../../../entity/transaction.entity";
import { TransactionResponse } from "../../../models/common/response/transaction.response";
import { getConnection } from "typeorm";
import { CorrectionRequest, TransactionRequest } from "../../../models/partner/request/transaction.request";
import { handleException, roundToTwo } from "../../../common/util/functions";
import { TradingPoint } from "../../../entity/trading-point.entity";
import { User } from "../../../entity/user.entity";
import { Terminal } from "../../../entity/terminal.entity";
import { Configuration } from "../../../entity/configuration.entity";
import { PartnerTransactionResponse } from "../../../models/partner/response/partner-transaction.response";
import { FirebaseAdminService } from "../../../common/service/firebase-admin.service";
import { TransactionStatus } from "../../../common/enum/status.enum";
import { VirtualCard } from "../../../entity/virtual-card.entity";
import { Ngo } from "../../../entity/ngo.entity";
import { PhysicalCard } from "../../../entity/physical-card.entity";
import { UserPeriod } from "../../../entity/user-period.entity";
import { TierService } from "../../common/tier.service";

const moment = require('moment');

@Controller() @ApiBearerAuth() @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER) @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER) @ApiTags("transaction")
export class PartnerTransactionController {
    private readonly logger = new Logger(PartnerTransactionController.name);

    constructor(private readonly calService: CalculationService,
                private readonly codeService: CodeService,
                private readonly firebaseService: FirebaseAdminService) {
    }

    @Post('correction') @Roles(RoleType.TERMINAL) @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: TransactionResponse})
    @ApiBody({type: CorrectionRequest})
    async createCorrection(@Req() req: any, @Body() dto: CorrectionRequest) {
        let terminal: Terminal = req.user;
        let p = dto.price;

        let oldTransaction: Transaction | undefined = await Transaction.createQueryBuilder('t')
            .leftJoinAndSelect('t.user', 'user')
            .leftJoinAndSelect('t.terminal', 'terminal')
            .leftJoinAndSelect('t.tradingPoint', 'point')
            .leftJoinAndSelect('t.ngo', 'ngo')
            .leftJoinAndSelect('user.account', 'account')
            .where('t.id = :id', {id: dto.transactionId})
            .andWhere('t.status = :status', {status: TransactionStatus.ACCEPTED})
            .getOne();


        const data: any = await getConnection().transaction(async entityManager => {

            if (!oldTransaction) {
                throw new BadRequestException('transaction_does_not_exists')
            }

            const period: UserPeriod | undefined = await UserPeriod.findActivePeriod();

            if (!period) {
                this.logger.error('Active User Period is not available');
                throw new BadRequestException('internal_server_error');
            }

            let correction = await Transaction.createQueryBuilder('t')
                                              .leftJoinAndSelect('t.correction', 'correction')
                                              .where('correction.id = :id', { id: oldTransaction.id })
                                              .getOne();

            if (correction && (correction.status === TransactionStatus.WAITING || correction.status === TransactionStatus.REJECTED)) {
                await entityManager.remove(correction);
            }

            let tradingPoint: TradingPoint = terminal.tradingPoint;
            let user: User = oldTransaction.user;
            let ngo: Ngo = oldTransaction.ngo;

            let transaction: Transaction = new Transaction(terminal, user, tradingPoint,
                ngo,
                period,
                this.codeService.generateTransactionID(),
                dto.price,
                tradingPoint.vat,
                tradingPoint.fee,
                tradingPoint.donationPercentage
            );

            transaction.updateXpValues(oldTransaction.userXp, oldTransaction.tradingPointXp);
            let pool = this.calService.calculateCost(dto.price, tradingPoint.donationPercentage, tradingPoint.vat);
            let provision = this.calService.calculateCost(dto.price, tradingPoint.fee, tradingPoint.vat);

            const halfPool = roundToTwo(pool / 2);
            transaction.updatePaymentValues(provision, pool);
            transaction.setUserPool(halfPool);
            transaction.ngoDonation = halfPool;
            transaction.isCorrection = true;
            transaction.correction = oldTransaction;

            await entityManager.save(transaction);
            await entityManager.save(oldTransaction);

            const data = {
                transactionID: transaction.ID,
                tradingPointName: tradingPoint.name,
                transactionDate: moment().format(Const.DATE_TIME_FORMAT),
                prevAmount: `${ oldTransaction.price }`,
                newAmount: `${ dto.price }`,
                terminalID: terminal.ID,
                isCorrection: "true",
                pool: `${ pool }`
            };

            if (terminal.isMain) {
                return {
                    token: user.account.firebaseToken,
                    data: data,
                    api: {
                        status: transaction.status,
                        oldPrice: oldTransaction.price,
                        price: p,
                        correction: pool - oldTransaction.poolValue,
                        donation: pool,
                        transactionID: transaction.ID
                    }
                }
            } else {
                return {
                    token: user.account.firebaseToken, api: {
                        status: transaction.status,
                        oldPrice: oldTransaction.price,
                        price: p,
                        transactionID: transaction.ID
                    }, data: data
                }
            }
        });

        this.firebaseService.getAdmin().messaging().send({
            token: data.token, data: data.data, notification: {
                title: 'Tadeus', body: 'Korekta transakcji do akceptacji',
            }
        })
            .then(() => this.logger.log("Notification send"))
            .catch((reason: any) => this.logger.error('Message not send. Reason: ' + reason));

        return data.api;
    }

    @Post() @Roles(RoleType.TERMINAL) @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: TransactionResponse})
    @ApiBody({type: TransactionRequest})
    async saveTransaction(@Req() req: any, @Body() dto: TransactionRequest) {
        try {
            const result = await getConnection().transaction(async entityManager => {
                let terminal: Terminal = req.user;

                const config: Configuration | undefined = await Configuration.getMain();
                const period: UserPeriod | undefined = await UserPeriod.findActivePeriod();

                if (!config || !period) {
                    this.logger.error('Configuration or Current Period is not available');
                    throw new BadRequestException('internal_server_error');
                }

                if (!terminal) {
                    this.logger.error(`Terminal does not exists`);
                    throw new BadRequestException('internal_server_error');
                }

                let tradingPoint: TradingPoint = terminal.tradingPoint;

                let user: User | undefined = await User.getUserForTransaction(dto.clientCode, dto.phonePrefix, dto.phone);

                if (!user) {
                    throw new BadRequestException('user_does_not_exists')
                }
                const ngo: Ngo | undefined = user.ngo;

                if (!ngo) {
                    throw new BadRequestException('ngo_not_selected')
                }

                let transaction: Transaction = new Transaction(
                    terminal,
                    user,
                    tradingPoint,
                    ngo,
                    period,
                    this.codeService.generateTransactionID(),
                    dto.price,
                    tradingPoint.vat,
                    tradingPoint.fee,
                    tradingPoint.donationPercentage,
                );

                const point: TradingPoint = transaction.tradingPoint;
                const virtualCard: VirtualCard = user.card;

                if (virtualCard.status !== 'ACTIVE') {
                    throw new BadRequestException('virtual_card_active');
                }

                const userXp = await this.calService.calculateXpForUser(user.id, user.xp, transaction);
                const tradingPointXp = await this.calService.calculateXpForPartner(tradingPoint.id, transaction);
                transaction.updateXpValues(userXp, tradingPointXp);

                tradingPoint.xp = tradingPointXp + Number(tradingPoint.xp);
                let pool = this.calService.calculateCost(dto.price, tradingPoint.donationPercentage, tradingPoint.vat);
                let halfPool = roundToTwo(pool / 2);

                let provision = this.calService.calculateCost(dto.price, tradingPoint.fee, tradingPoint.vat);
                transaction.updatePaymentValues(provision, pool);

                transaction.setUserPool(halfPool);

                transaction.status = TransactionStatus.ACCEPTED;
                transaction.ngoDonation = halfPool;

                user.xp += transaction.userXp;
                virtualCard.updatePool(transaction.poolValue);
                user.updateCollectedMoney(transaction.poolValue);

                let card: PhysicalCard = ngo.card;
                card.collectedMoney += transaction.poolValue;

                TierService.asignTier(halfPool, user, virtualCard)

                await entityManager.save(card);
                await entityManager.save(virtualCard);
                await entityManager.save(point);
                await entityManager.save(user);
                await entityManager.save(transaction);

                const data = {
                    transactionID: transaction.ID,
                    tradingPointName: tradingPoint.name,
                    transactionDate: moment().format(Const.DATE_TIME_FORMAT),
                    newAmount: `${dto.price}`,
                    terminalID: terminal.ID,
                    isCorrection: "false",
                    pool: `${transaction.poolValue}`
                };

                if (terminal.isMain) {
                    return {
                        token: user.account.firebaseToken,
                        api: {
                            price: dto.price,
                            donation: pool,
                            transactionID: transaction.ID
                        },
                        data: data
                    }
                } else {
                    return {
                        token: user.account.firebaseToken,
                        api: {
                            price: dto.price,
                            donation: pool,
                            transactionID: transaction.ID
                        },
                        data: data
                    }
                }
            });

            this.firebaseService.getAdmin().messaging().send({
                token: result.token as string,
                data: result.data,
                notification: {
                    title: 'Tadeus',
                    body: 'Nowa transakcja',
                }
            })
                .then(() => this.logger.log("Notification send"))
                .catch((reason: any) => this.logger.error('Message not send. Reason: ' + reason));

            return result.api;
        } catch (e) {
            handleException(e, 'transaction', this.logger)
        }
    }

    @Get(':ID/status') @Roles(RoleType.TERMINAL) @UseGuards(JwtAuthGuard, RolesGuard)
    async getTransactionStatus(@Req() req: any, @Param('ID') id: string) {
        const terminal: Terminal = req.user;
        const t: Transaction | undefined = await Transaction.findOne({ID: id}, {relations: ['correction']});

        if (!t) {
            throw new NotFoundException('transaction_does_not_exists')
        }
        if (!t.isCorrection || !t.correction) {
            this.logger.error('This transaction is not a correction');
            throw new InternalServerErrorException();
        }

        if (terminal.isMain) {
            return {
                status: t.status,
                oldPrice: t.correction.price,
                price: t.price,
                correction: t.poolValue - t.correction.poolValue,
                donation: t.poolValue
            }
        } else {
            return {
                status: t.status,
                oldPrice: t.correction.price,
                price: t.price,
            }
        }
    }

    @Get() @Roles(RoleType.TERMINAL) @UseGuards(JwtAuthGuard, RolesGuard)
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
