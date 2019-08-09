import { BadRequestException, Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { User } from "../../database/entity/user.entity";
import { Roles } from "../../common/decorators/roles.decorator";
import { RoleEnum } from "../../common/enum/role.enum";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Cart } from "../../database/entity/cart.entity";
import { Transaction } from "../../database/entity/transaction.entity";
import { createQueryBuilder } from "typeorm";
import { TradingPoint } from "../../database/entity/trading-point.entity";
import { ApiImplicitHeader, ApiResponse } from "@nestjs/swagger";
import { Const } from "../../common/util/const";
import { CalculationService } from "../../common/service/calculation.service";
import {
    CorrectionResponse,
    CorrectionSuccessResponse,
    TransactionSuccessResponse
} from "../../models/response/transaction-success.response";
import { TransactionResponse } from "../../models/response/transaction.response";

const moment = require('moment');

@Controller()
export class TransactionController {
    constructor(private readonly calService: CalculationService) {
    }

    @Post('correction/approve')
    @Roles(RoleEnum.CLIENT)
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
    async correctionApprove(@Req() req, @Body() dto: CorrectionResponse) {
        let transaction = await Transaction.findOne({id: dto.transactionId});
        transaction.verifiedByUser = true;
        await transaction.save();
    }

    @Get('corrections')
    @Roles(RoleEnum.CLIENT)
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
    async correctionClient(@Req() req) {
        let user: User = req.user;
        return await Transaction.find({user: user, isCorrection: true, verifiedByUser: false})
    }

    @Get('correction/:id')
    @Roles(RoleEnum.PARTNER)
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
        let transaction = await Transaction.findOne({id: id, tradingPoint: user.tradingPoint});
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
    @Roles(RoleEnum.PARTNER)
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
        let tradingPoint: TradingPoint = partner.tradingPoint;


        let transaction: Transaction = await Transaction.findOne({id: dto.transactionId}, {relations: ['user']});
        let user: User = transaction.user;

        let pool = this.calService.calculateX(transaction.price, transaction.donationPercentage, tradingPoint.defaultVat);

        user.xp -= transaction.userXp;
        user.personalPool -= pool / 2;
        user.donationPool -= pool / 2;
        user.collectedMoney -= pool;
        transaction.isCorrection = true;

        tradingPoint.xp -= transaction.tradingPointXp;

        try {
            await transaction.save();
            await tradingPoint.save();
            await user.save();
        } catch (e) {
            throw new BadRequestException("correction_not_created")
        }
    }

    @Post()
    @Roles(RoleEnum.PARTNER)
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
    async saveTransaction(@Req() req, @Body() dto: TransactionResponse) {
        let partner: User = req.user;
        let tradingPoint: TradingPoint = partner.tradingPoint;

        let currentCart: Cart = await Cart.findOne({tradingPoint: partner.tradingPoint}, {relations: ['transactions']});
        let user: User = await createQueryBuilder('User')
            .leftJoinAndSelect('User.virtualCard', 'virtualCard')
            .leftJoinAndSelect('User.ngo', 'ngo')
            .where('virtualCard.code = :code', {code: dto.clientCode}).execute();

        if (!currentCart.id) {
            currentCart = new Cart();
            currentCart.transactions = [];
        }
        try {
            if (!currentCart.id) {
                currentCart = await currentCart.save();
            }
            let transaction: Transaction = new Transaction();
            transaction.user = user;
            transaction.cart = currentCart;
            transaction.ngo = user.ngo;
            transaction.tradingPoint = partner.tradingPoint;
            transaction.price = dto.price;
            transaction.recipeCode = 'FV-12345'; // TODO: Auto Create
            transaction.donationPercentage = dto.donationPercentage;

            const userXp = await this.calculateXpForUser(user, transaction);
            const tradingPointXp = this.calService.calculateTradingPointXp(currentCart);

            transaction.userXp = userXp;
            transaction.tradingPointXp = tradingPointXp;
            tradingPoint.xp += tradingPointXp;

            user.xp += userXp;

            let pool = this.calService.calculateX(dto.price, dto.donationPercentage, tradingPoint.defaultVat);
            let t = this.calService.calculateY(dto.price, tradingPoint.manipulationFee, tradingPoint.defaultVat);

            transaction.donationValue = t + pool;
            user.personalPool += pool / 2;
            user.donationPool += pool / 2;
            user.collectedMoney += pool;

            let savedTransaction = await transaction.save();
            currentCart.transactions.push(savedTransaction);

            await currentCart.save();
            await tradingPoint.save();
            await user.save();

            let result = new TransactionSuccessResponse();
            result.date = "";
            result.price = dto.price;
            result.xp = userXp;
            return result;
        } catch (e) {
            throw new BadRequestException("transaction_not_created")
        }
    }


    private async calculateXpForUser(user: User, currenctTransaction: Transaction): Promise<number> {
        let transactions = await createQueryBuilder("Transaction")
            .leftJoinAndSelect("Transaction.user", 'user')
            .leftJoinAndSelect('Transaction.tradingPoint', 'tradingPoint')
            .where('Transaction.createdAt > :date', {date: moment().subtract(1, 'days').toISOString()})
            .andWhere('Transaction.isCorrection = false')
            .andWhere('user = :user', {user: user})
            .getMany();

        let previousXp = this.calService.calculate(transactions, currenctTransaction);
        transactions.push(currenctTransaction);
        let currentXp = this.calService.calculate(transactions, currenctTransaction);

        return transactions.length === 0 ? 10 : currentXp - previousXp;
    }

}
