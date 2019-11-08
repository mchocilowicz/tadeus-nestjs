import {BadRequestException, Body, Controller, Logger, Post, Req, UseGuards} from "@nestjs/common";
import {CalculationService} from "../../../common/service/calculation.service";
import {CodeService} from "../../../common/service/code.service";
import {Roles} from "../../../common/decorators/roles.decorator";
import {RoleEnum} from "../../../common/enum/role.enum";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";
import {ApiImplicitBody, ApiImplicitHeader, ApiResponse, ApiUseTags} from "@nestjs/swagger";
import {Const} from "../../../common/util/const";
import {Transaction} from "../../../database/entity/transaction.entity";
import {TransactionResponse} from "../../../models/response/transaction.response";
import {getConnection} from "typeorm";
import {CorrectionRequest, TransactionRequest} from "../models/transaction.request";
import {UserDetails} from "../../../database/entity/user-details.entity";
import {TransactionSuccessResponse} from "../../../models/response/transaction-success.response";
import {handleException} from "../../../common/util/functions";
import {VirtualCard} from "../../../database/entity/virtual-card.entity";
import {TradingPoint} from "../../../database/entity/trading-point.entity";
import {User} from "../../../database/entity/user.entity";
import {Terminal} from "../../../database/entity/terminal.entity";
import {Notification} from "../../../database/entity/notification.entity";
import {Correction} from "../../../database/entity/correction.entity";
import {Configuration} from "../../../database/entity/configuration.entity";
import {PartnerPayment} from "../../../database/entity/partner-payment.entity";
import {Period} from "../../../database/entity/period.entity";

const moment = require('moment');

@Controller()
@ApiUseTags("transaction")
export class TransactionController {
    private readonly logger = new Logger(TransactionController.name);

    constructor(private readonly calService: CalculationService, private readonly codeService: CodeService) {
    }

    @Post('correction')
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: TransactionResponse})
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
    @ApiImplicitBody({name: '', type: CorrectionRequest})
    async createCorrection(@Req() req: any, @Body() request: CorrectionRequest) {
        let i = request.transactionId;
        let p = request.price;

        let t: Transaction | undefined = await Transaction.findOne({id: i}, {relations: ['user']});
        if (t) {
            let request = new Correction(p, 'CV', req.user.terminal, t, t.user, t.tradingPoint, t.poolValue, t.paymentValue, t.price);
            await getConnection().transaction(async entityManager => {
                await entityManager.save(t);
                request = await entityManager.save(request);
                if (request.id && t) {
                    let n = new Notification('', t.user, request.id);
                    await entityManager.save(n);
                }
            });

            return {
                date: new Date(),
                oldPrice: t.price,
                price: p,
                a: t.poolValue,
                // b: this.calService.calculateCost(p,)
            }
        }
    }

    @Post()
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: TransactionResponse})
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
    @ApiImplicitBody({name: '', type: TransactionRequest})
    async saveTransaction(@Req() req: any, @Body() dto: TransactionRequest) {
        let partner: User = req.user;

        try {
            return await getConnection().transaction(async entityManager => {
                let terminal: Terminal | undefined = partner.terminal;

                const config: Configuration | undefined = await Configuration.findOne({type: 'MAIN'});
                const period: Period | undefined = await Period.findCurrentPartnerPeriod();

                if (!config || !period) {
                    throw new BadRequestException('internal_server_error');
                }

                if (!terminal) {
                    throw new BadRequestException('internal_server_error');
                }

                let payment: PartnerPayment | undefined = await PartnerPayment.findOne({period: period});

                let tradingPoint: TradingPoint = terminal.tradingPoint;

                if (!payment) {
                    payment = new PartnerPayment(this.codeService.generatePartnerPaymentID(), tradingPoint, period);
                    payment = await entityManager.save(payment)
                }


                let user: User | undefined = await User.getUserByCardCode(dto.clientCode);

                if (!user || !user.details || !user.id || !user.card || !tradingPoint.id) {
                    throw new BadRequestException('user_does_not_exists')
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
                    tradingPoint.donationPercentage
                );

                const userXp = await this.calService.calculateXpForUser(user.id, user.details, transaction);
                const tradingPointXp = await this.calService.calculateXpForPartner(tradingPoint.id, transaction);

                transaction.updateXpValues(userXp, tradingPointXp);
                tradingPoint.xp = tradingPointXp + Number(tradingPoint.xp);

                const userDetails: UserDetails = user.details;
                const virtualCard: VirtualCard = user.card;

                userDetails.xp += userXp;

                let pool = this.calService.calculateCost(dto.price, tradingPoint.donationPercentage, tradingPoint.vat);
                let provision = this.calService.calculateCost(dto.price, tradingPoint.fee, tradingPoint.vat);

                transaction.updatePaymentValues(provision, pool);
                payment.price += Number(provision + pool);

                virtualCard.updatePool(pool);
                userDetails.updateCollectedMoney(pool);

                await entityManager.save(transaction);

                if (userDetails.ngo) {
                    let card = userDetails.ngo.card;
                    if (!card) {
                        throw new BadRequestException('internal_server_error');
                    }
                    card.collectedMoney += pool;
                    await entityManager.save(card)
                } else {
                    userDetails.ngoTempMoney += pool;
                }

                await entityManager.save(virtualCard);
                await entityManager.save(payment);
                await entityManager.save(tradingPoint);
                await entityManager.save(userDetails);

                return new TransactionSuccessResponse(
                    moment().format('YYYY-MM-DD'),
                    dto.price,
                    userXp
                )
            });
        } catch (e) {
            handleException(e, 'transaction', this.logger)
        }
    }

}
