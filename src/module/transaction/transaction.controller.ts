import { Body, Controller, Get, Logger, Param, Post, Req, UseGuards } from "@nestjs/common";
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
import { handleException } from "../../common/util/functions";
import { CodeService } from "../../common/service/code.service";

const moment = require('moment');

@Controller()
export class TransactionController {
    private readonly logger = new Logger(TransactionController.name);

    constructor(private readonly calService: CalculationService, private readonly codeService: CodeService) {
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

        let pool = this.calService.calculateX(transaction.price, transaction.donationPercentage, tradingPoint.vat);

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
        let tradingPoint: TradingPoint = partner.tradingPoint;

        let currentCart: Cart = await Cart.findOne({tradingPoint: partner.tradingPoint}, {relations: ['transactions']});
        let user: any = await createQueryBuilder('User')
            .leftJoin('User.card', 'card')
            .leftJoinAndSelect('User.ngo', 'ngo')
            .where('card.code = :code', {code: dto.clientCode}).getOne();

        if (!currentCart) {
            currentCart = new Cart();
            currentCart.transactions = [];
        }
        try {
            if (!currentCart.id) {
                currentCart = await currentCart.save();
            }
            let transaction: Transaction = new Transaction();
            transaction.ID = this.codeService.generateTransactionID();
            transaction.user = user;
            transaction.ngo = user.ngo;
            transaction.tradingPoint = partner.tradingPoint;
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

            let savedTransaction = await transaction.save();
            currentCart.transactions.push(savedTransaction);

            await currentCart.save();
            await tradingPoint.save();
            await user.save();

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

        let previousXp = user.xp;
        transactions.push(currenctTransaction);
        let currentXp = this.calService.calculate(transactions, currenctTransaction) + previousXp;

        return transactions.length === 1 ? 10 : currentXp - previousXp;
    }

}
