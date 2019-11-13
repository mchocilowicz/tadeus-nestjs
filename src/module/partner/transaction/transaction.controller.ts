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
import {TransactionResponse} from "../../../models/common/response/transaction.response";
import {getConnection} from "typeorm";
import {CorrectionRequest, TransactionRequest} from "../../../models/partner/request/transaction.request";
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
import {Donation} from "../../../database/entity/donation.entity";
import {DonationEnum, PoolEnum} from "../../../common/enum/donation.enum";

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
        let terminal: Terminal = req.user;
        let i = request.transactionId;
        let p = request.price;

        let t: Transaction | undefined = await Transaction.findOne({id: i}, {relations: ['user']});
        if (t) {
            let request = new Correction(p, 'CV', terminal, t, t.user, t.tradingPoint, t.poolValue, t.paymentValue, t.price);
            await getConnection().transaction(async entityManager => {
                await entityManager.save(t);
                request = await entityManager.save(request);
                if (request.id && t) {
                    let n = new Notification('', t.user, request.id);
                    await entityManager.save(n);
                }
            });

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
                user.updateCollectedMoney(pool);

                await entityManager.save(transaction);

                if (user.ngo) {
                    let card = user.ngo.card;
                    if (!card) {
                        this.logger.error(`Physical Card is not assigned to Ngo ${user.ngo.id}`);
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

}
