import { Body, Controller, Get, Logger, Param, Post, Req, UseGuards } from "@nestjs/common";
import { CalculationService } from "../../../common/service/calculation.service";
import { CodeService } from "../../../common/service/code.service";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleEnum } from "../../../common/enum/role.enum";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { Const } from "../../../common/util/const";
import {
    CorrectionResponse,
    CorrectionSuccessResponse,
    TransactionSuccessResponse
} from "../../../models/response/transaction-success.response";
import { Transaction } from "../../../database/entity/transaction.entity";
import { User } from "../../../database/entity/user.entity";
import { TradingPoint } from "../../../database/entity/trading-point.entity";
import { TransactionResponse } from "../../../models/response/transaction.response";
import { handleException } from "../../../common/util/functions";
import { Cart } from "../../../database/entity/cart.entity";
import { createQueryBuilder, getConnection } from "typeorm";

const moment = require('moment');

@Controller()
@ApiUseTags("partner/transaction")
export class TransactionController {
    private readonly logger = new Logger(TransactionController.name);

    constructor(private readonly calService: CalculationService, private readonly codeService: CodeService) {
    }

    @Get('correction/:id')
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
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
    @ApiResponse({status: 200, type: CorrectionSuccessResponse})
    async verifyCorrection(@Req() req, @Param('id') id) {
        let user: User = req.user;
        let transaction = await Transaction.findOne({id: id, tradingPoint: user.terminal.tradingPoint});
        if (transaction.verifiedByUser) {
            const dto = new CorrectionSuccessResponse();
            dto.date = moment().format("YYYY-MM-DD");
            dto.price = transaction.price;
            dto.xp = transaction.userXp;
            return dto;
        } else {
            return null;
        }
    }

    @Post('correction')
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
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
    async correction(@Req() req, @Body() dto: CorrectionResponse) {
        let partner: User = req.user;
        let tradingPoint: TradingPoint = partner.terminal.tradingPoint;


        let transaction: Transaction = await Transaction.findOne({id: dto.transactionId}, {relations: ['user']});
        let user: User = transaction.user;

        let pool = this.calService.calculateX(transaction.price, transaction.donationPercentage, tradingPoint.vat);

        user.details.xp -= transaction.userXp;
        user.card.personalPool -= pool / 2;
        user.card.donationPool -= pool / 2;
        user.details.collectedMoney -= pool;
        transaction.isCorrection = true;

        tradingPoint.xp -= transaction.tradingPointXp;

        try {
            await getConnection().transaction(async entityManager => {
                await entityManager.save(transaction);
                await entityManager.save(tradingPoint);
                await entityManager.save(user);
            })

        } catch (e) {
            handleException(e, 'correction', this.logger)
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
    async saveTransaction(@Req() req, @Body() dto: { price, donationPercentage, clientCode }) {
        let partner: User = req.user;
        let tradingPoint: TradingPoint = partner.terminal.tradingPoint;

        let currentCart: Cart = await Cart.findOne({
            tradingPoint: partner.terminal.tradingPoint,
            isPaid: false,
            paymentDate: null
        }, {relations: ['transactions']});
        let user: any = await createQueryBuilder('User')
            .leftJoin('User.card', 'card')
            .leftJoinAndSelect('User.ngo', 'ngo')
            .where('card.code = :code', {code: dto.clientCode}).getOne();

        if (!currentCart) {
            currentCart = new Cart();
            currentCart.transactions = [];
        }
        try {
            let transaction: Transaction = new Transaction();
            transaction.ID = this.codeService.generateTransactionID();
            transaction.user = user;
            transaction.tradingPoint = partner.terminal.tradingPoint;
            transaction.price = dto.price;
            transaction.donationPercentage = dto.donationPercentage;

            const userXp = await this.calculateXpForUser(user, transaction);
            const tradingPointXp = this.calService.calculateTradingPointXp(currentCart);

            transaction.userXp = userXp;
            transaction.tradingPointXp = tradingPointXp;
            tradingPoint.xp = tradingPointXp + Number(tradingPoint.xp);

            user.xp += userXp;

            let pool = this.calService.calculateX(dto.price, dto.donationPercentage, tradingPoint.vat);
            let t = this.calService.calculateY(dto.price, tradingPoint.manipulationFee, tradingPoint.vat);

            transaction.donationValue = t + pool;
            user.personalPool = (pool / 2) + Number(user.personalPool);
            user.donationPool = (pool / 2) + Number(user.donationPool);
            user.collectedMoney = pool + Number(user.collectedMoney);
            transaction.terminal = partner.terminal;

            await getConnection().transaction(async entityManager => {
                if (!currentCart.id) {
                    currentCart = await entityManager.save(currentCart);
                }

                currentCart.price += transaction.price;
                let savedTransaction = await entityManager.save(transaction);
                currentCart.transactions.push(savedTransaction);

                await entityManager.save(currentCart);
                await entityManager.save(tradingPoint);
                await entityManager.save(user);
            });

            let result = new TransactionSuccessResponse();
            result.date = moment().format('YYYY-MM-DD');
            result.price = dto.price;
            result.xp = userXp;
            return result;
        } catch (e) {
            handleException(e, 'transaction', this.logger)
        }
    }


    private async calculateXpForUser(user: User, currenctTransaction: Transaction): Promise<number> {
        let transactions = await createQueryBuilder("Transaction", 'transaction')
            .leftJoinAndSelect("transaction.user", 'user')
            .leftJoinAndSelect('transaction.tradingPoint', 'tradingPoint')
            .where(`to_date(cast(transaction.createdAt as TEXT),'YYYY-MM-DD') = to_date('${moment().format('YYYY-MM-DD')}','YYYY-MM-DD')`)
            .andWhere('transaction.isCorrection = false')
            .andWhere('user.id = :user', {user: user.id})
            .getMany();

        transactions.push(currenctTransaction);
        return this.calService.calculate(transactions, currenctTransaction.tradingPoint, user.details.xp)
    }

}
