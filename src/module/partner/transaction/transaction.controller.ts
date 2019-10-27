import { BadRequestException, Body, Controller, Logger, Post, Req, UseGuards } from "@nestjs/common";
import { CalculationService } from "../../../common/service/calculation.service";
import { CodeService } from "../../../common/service/code.service";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleEnum } from "../../../common/enum/role.enum";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { ApiImplicitBody, ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { Const } from "../../../common/util/const";
import { Transaction } from "../../../database/entity/transaction.entity";
import { TransactionResponse } from "../../../models/response/transaction.response";
import { getConnection, getRepository } from "typeorm";
import { TransactionRequest } from "../models/transaction.request";
import { UserDetails } from "../../../database/entity/user-details.entity";
import { TransactionSuccessResponse } from "../../../models/response/transaction-success.response";
import { handleException } from "../../../common/util/functions";
import { VirtualCard } from "../../../database/entity/virtual-card.entity";
import { Cart } from "../../../database/entity/cart.entity";
import { TradingPoint } from "../../../database/entity/trading-point.entity";
import { User } from "../../../database/entity/user.entity";
import { Terminal } from "../../../database/entity/terminal.entity";

const moment = require('moment');

@Controller()
@ApiUseTags("transaction")
export class TransactionController {
    private readonly logger = new Logger(TransactionController.name);

    constructor(private readonly calService: CalculationService, private readonly codeService: CodeService) {
    }

    // @Get('correction/:id')
    // @Roles(RoleEnum.TERMINAL)
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @ApiImplicitHeader({
    //     name: Const.HEADER_ACCEPT_LANGUAGE,
    //     required: true,
    //     description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    // })
    // @ApiImplicitHeader({
    //     name: Const.HEADER_AUTHORIZATION,
    //     required: true,
    //     description: Const.HEADER_AUTHORIZATION_DESC
    // })
    // @ApiResponse({status: 200, type: CorrectionSuccessResponse})
    // async verifyCorrection(@Req() req, @Param('id') id) {
    //     let user: User = req.user;
    //     let transaction = await Transaction.findOne({id: id, tradingPoint: user.terminal.tradingPoint});
    //     if (transaction.verifiedByUser) {
    //         const dto = new CorrectionSuccessResponse();
    //         dto.date = moment().format("YYYY-MM-DD");
    //         dto.price = transaction.price;
    //         dto.xp = transaction.userXp;
    //         return dto;
    //     } else {
    //         return null;
    //     }
    // }
    //
    // @Post('correction')
    // @Roles(RoleEnum.TERMINAL)
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @ApiImplicitHeader({
    //     name: Const.HEADER_ACCEPT_LANGUAGE,
    //     required: true,
    //     description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    // })
    // @ApiImplicitHeader({
    //     name: Const.HEADER_AUTHORIZATION,
    //     required: true,
    //     description: Const.HEADER_AUTHORIZATION_DESC
    // })
    // async correction(@Req() req, @Body() dto: CorrectionResponse) {
    //     let partner: User = req.user;
    //     let tradingPoint: TradingPoint = partner.terminal.tradingPoint;
    //
    //     let transaction: Transaction = await Transaction.findOne({id: dto.transactionId}, {relations: ['user']});
    //     let userId: string = transaction.user.id;
    //
    //     // user.details.xp -= transaction.userXp;
    //     // user.card.personalPool -= pool / 2;
    //     // user.card.donationPool -= pool / 2;
    //     // user.details.collectedMoney -= pool;
    //     // transaction.isCorrection = true;
    //
    //     // tradingPoint.xp -= transaction.tradingPointXp;
    //
    //
    //     ////
    //
    //     let currentCart: Cart = await Cart.findOne({
    //         tradingPoint: partner.terminal.tradingPoint,
    //         isPaid: false,
    //         paymentDate: null
    //     }, {relations: ['transactions']});
    //     let user: any = await createQueryBuilder('User', 'user')
    //         .leftJoin('user.card', 'card')
    //         .leftJoinAndSelect('user.details', 'details')
    //         .leftJoinAndSelect('details.ngo', 'ngo')
    //         .leftJoinAndSelect('ngo.card', 'card')
    //         .where('user.id = :id', {id: userId})
    //         .getOne();
    //
    //     if (!currentCart) {
    //         currentCart = new Cart();
    //         currentCart.transactions = [];
    //     }
    //     try {
    //         let transaction: Transaction = new Transaction();
    //         transaction.ID = this.codeService.generateTransactionID();
    //         transaction.user = user;
    //         transaction.tradingPoint = partner.terminal.tradingPoint;
    //         transaction.price = dto.price;
    //         transaction.donationPercentage = tradingPoint.donationPercentage;
    //
    //         const userXp = await this.calculateXpForUser(user, transaction);
    //         const tradingPointXp = this.calService.calculateTradingPointXp(currentCart);
    //
    //         transaction.userXp = userXp;
    //         transaction.tradingPointXp = tradingPointXp;
    //         tradingPoint.xp = tradingPointXp + Number(tradingPoint.xp);
    //         let userDetails = user.details;
    //
    //         userDetails.xp += userXp;
    //
    //         let pool = this.calService.calculateX(dto.price, tradingPoint.donationPercentage, tradingPoint.vat);
    //         let t = this.calService.calculateY(dto.price, tradingPoint.fee, tradingPoint.vat);
    //
    //         transaction.donationValue = t + pool;
    //         userDetails.personalPool = (pool / 2) + Number(user.personalPool);
    //         userDetails.donationPool = (pool / 2) + Number(user.donationPool);
    //         userDetails.collectedMoney = pool + Number(user.collectedMoney);
    //         transaction.terminal = partner.terminal;
    //         transaction.isCorrection = true;
    //
    //         await getConnection().transaction(async entityManager => {
    //             if (!currentCart.id) {
    //                 currentCart = await entityManager.save(currentCart);
    //             }
    //
    //             currentCart.price += transaction.price;
    //             let savedTransaction = await entityManager.save(transaction);
    //             currentCart.transactions.push(savedTransaction);
    //             if (user.details.ngo) {
    //                 let card = user.details.ngo.card;
    //                 card.collectedMoney += pool;
    //                 await entityManager.save(card)
    //             } else {
    //                 user.details.ngoTempMoney += pool;
    //             }
    //             await entityManager.save(currentCart);
    //             await entityManager.save(tradingPoint);
    //             await entityManager.save(userDetails);
    //         });
    //
    //         let result = new TransactionSuccessResponse();
    //         result.date = moment().format('YYYY-MM-DD');
    //         result.price = dto.price;
    //         result.xp = userXp;
    //         return result;
    //
    //
    //         // try {
    //         //     await getConnection().transaction(async entityManager => {
    //         //         await entityManager.save(transaction);
    //         //         await entityManager.save(tradingPoint);
    //         //         await entityManager.save(user);
    //         //     })
    //         //
    //     } catch (e) {
    //         handleException(e, 'correction', this.logger)
    //     }
    // }

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

                if (!terminal) {
                    throw new BadRequestException('internal_server_error');
                }

                let tradingPoint: TradingPoint = terminal.tradingPoint;

                let currentCart: Cart | undefined = await Cart.createQueryBuilder('cart')
                    .leftJoinAndSelect('cart.transactions', 'transaction')
                    .leftJoinAndSelect('cart.tradingPoint', 'point')
                    .where('point.id = :id', {id: tradingPoint.id})
                    .andWhere('cart.isPaid = false')
                    .getOne();

                let user: User | undefined = await User.createQueryBuilder('user')
                    .leftJoinAndSelect('user.card', 'virtual-card')
                    .leftJoinAndSelect('user.details', 'details')
                    .leftJoinAndSelect('details.ngo', 'ngo')
                    .leftJoinAndSelect('ngo.card', 'physical-card')
                    .where('virtual-card.code = :code', {code: dto.clientCode})
                    .getOne();

                if (!user || !user.details || !user.id || !user.card) {
                    throw new BadRequestException('user_does_not_exists')
                }

                if (!currentCart) {
                    currentCart = await entityManager.save(new Cart(tradingPoint));
                }

                let transaction: Transaction = new Transaction(
                    terminal,
                    user,
                    tradingPoint,
                    currentCart,
                    this.codeService.generateTransactionID(),
                    dto.price
                );

                transaction.donationPercentage = tradingPoint.donationPercentage;
                const userXp = await this.calculateXpForUser(user.id, user.details, transaction);
                const tradingPointXp = this.calService.calculateTradingPointXp(currentCart);

                transaction.userXp = userXp;
                transaction.tradingPointXp = tradingPointXp;
                tradingPoint.xp = tradingPointXp + Number(tradingPoint.xp);

                const userDetails: UserDetails = user.details;
                const virtualCard: VirtualCard = user.card;

                userDetails.xp += userXp;

                let pool = this.calService.calculateX(dto.price, tradingPoint.donationPercentage, tradingPoint.vat);
                let t = this.calService.calculateY(dto.price, tradingPoint.fee, tradingPoint.vat);

                transaction.donationValue = t + pool;

                virtualCard.personalPool = (pool / 2) + Number(virtualCard.personalPool);
                virtualCard.donationPool = (pool / 2) + Number(virtualCard.donationPool);
                userDetails.collectedMoney = pool + Number(userDetails.collectedMoney);

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

                currentCart.price += transaction.price;
                await entityManager.save(currentCart);
                await entityManager.save(virtualCard);
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


    private async calculateXpForUser(userId: string, details: UserDetails, currenctTransaction: Transaction): Promise<number> {
        let transactions: Transaction[] = await getRepository(Transaction)
            .createQueryBuilder('transaction')
            .leftJoinAndSelect("transaction.user", 'user')
            .leftJoinAndSelect('transaction.tradingPoint', 'tradingPoint')
            .where(`to_date(cast(transaction.createdAt as TEXT),'YYYY-MM-DD') = to_date('${moment().format('YYYY-MM-DD')}','YYYY-MM-DD')`)
            .andWhere('transaction.isCorrection = false')
            .andWhere('user.id = :user', {user: userId})
            .getMany();

        transactions.push(currenctTransaction);
        return this.calService.calculate(transactions, currenctTransaction.tradingPoint, details.xp)
    }

}
