import { BadRequestException, Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { TransactionDto } from "../../dto/transaction.dto";
import { User } from "../../database/entity/user.entity";
import { Roles } from "../../common/decorators/roles.decorator";
import { RoleEnum } from "../../common/enum/role.enum";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Cart } from "../../database/entity/cart.entity";
import { Transaction } from "../../database/entity/transaction.entity";
import { createQueryBuilder } from "typeorm";
import { TransactionSuccessDto } from "../../dto/transaction-success.dto";
import { TradingPoint } from "../../database/entity/trading-point.entity";

const moment = require('moment');

@Controller()
export class TransactionController {

    @Post('correction/approve')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async transactionA(@Req() req, @Body() dto: { transactionId: string }) {
        let transaction = await Transaction.findOne({id: dto.transactionId});
        transaction.verifiedByUser = true;
        await transaction.save();
    }

    @Get('correction')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async transactionC(@Req() req) {
        let user: User = req.user;
        return await Transaction.find({user: User, isCorrection: true, verifiedByUser: false})
    }

    @Get('correction/:id')
    @Roles(RoleEnum.PARTNER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async transactionV(@Req() req, @Param('id') id) {
        let user: User = req.user;
        return await Transaction.findOne({id: id, tradingPoint: user.tradingPoint});
    }

    @Post('correction')
    @Roles(RoleEnum.PARTNER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async correction(@Req() req, @Body() dto: { transactionId: string }) {
        let partner: User = req.user;
        let tradingPoint: TradingPoint = partner.tradingPoint;


        let transaction: Transaction = await Transaction.findOne({id: dto.transactionId}, {relations: ['user']});
        let user: User = transaction.user;

        user.xp -= transaction.userXp;
        user.personalPool -= transaction.price;
        user.donationPool -= transaction.donationValue;
        user.collectedMoney -= transaction.price;
        transaction.isCorrection = true;

        tradingPoint.xp -= transaction.tradingPointXp;

        try {
            await transaction.save();
            await tradingPoint.save();
            await user.save();
        } catch (e) {
            throw new BadRequestException("Transakacja sie nie powiodla. Prosze sprobowac ponownie.")
        }
        return "TADAM";
    }

    @Post()
    @Roles(RoleEnum.PARTNER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async saveTransaction(@Req() req, @Body() dto: TransactionDto) {
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
            transaction.donationValue = dto.price;

            const userXp = await this.calculateXpForUser(user, transaction);
            const tradingPointXp = this.calculateTradingPointXp(currentCart);

            transaction.userXp = userXp;
            transaction.tradingPointXp = tradingPointXp;
            tradingPoint.xp += tradingPointXp;

            user.xp += userXp;
            user.personalPool += dto.price;
            user.donationPool += dto.price;
            user.collectedMoney += dto.price;

            let savedTransaction = await transaction.save();
            currentCart.transactions.push(savedTransaction);

            await currentCart.save();
            await tradingPoint.save();
            await user.save();

            let result = new TransactionSuccessDto();
            result.date = "";
            result.price = dto.price;
            result.xp = userXp;
            return result;

        } catch (e) {
            throw new BadRequestException("Transakacja sie nie powiodla. Prosze sprobowac ponownie.")
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

        let previousXp = this.calculate(transactions, currenctTransaction);
        transactions.push(currenctTransaction);
        let currentXp = this.calculate(transactions, currenctTransaction);

        return transactions.length === 0 ? 10 : currentXp - previousXp;
    }

    private calculate(transactions: any[], currenctTransaction: Transaction): number {
        let transactionsInSameShop = transactions.filter((t: Transaction) => t.tradingPoint.id === currenctTransaction.tradingPoint.id);
        let transactionsInOtherShops = transactions.filter((t: Transaction) => t.tradingPoint.id !== currenctTransaction.tradingPoint.id);

        let xp = 0;
        if (transactionsInSameShop.length !== 0) {
            xp += 10 * transactionsInSameShop.length;
        }
        if (transactionsInOtherShops.length !== 0) {
            let currentXp = 0;
            let index = 1;
            for (let transaction in transactionsInOtherShops) {
                if (index === 1) {
                    currentXp += 10;
                } else {
                    currentXp += 2 * currentXp;
                }
                index++;
            }
        }
        return xp;
    }

    private calculateTradingPointXp(cart: Cart): number {
        const defaultXp = 20;
        if (cart.transactions.length === 0) {
            return 50;
        } else if (cart.transactions.length < 20) {
            return defaultXp;
        } else if ((cart.transactions.length % 50) === 0) {
            return defaultXp + 200;
        } else if ((cart.transactions.length % 20) === 0) {
            return defaultXp + 50;
        } else {
            return defaultXp;
        }
    }
}
