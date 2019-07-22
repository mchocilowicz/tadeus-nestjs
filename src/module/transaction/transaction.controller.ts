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
import { CorrectionDto, CorrectionSuccessDto, TransactionSuccessDto } from "../../dto/transaction-success.dto";
import { TradingPoint } from "../../database/entity/trading-point.entity";
import { ApiResponse } from "@nestjs/swagger";

const moment = require('moment');

@Controller()
export class TransactionController {

    @Post('correction/approve')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async correctionApprove(@Req() req, @Body() dto: CorrectionDto) {
        let transaction = await Transaction.findOne({id: dto.transactionId});
        transaction.verifiedByUser = true;
        await transaction.save();
    }

    @Get('corrections')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async correctionClient(@Req() req) {
        let user: User = req.user;
        return await Transaction.find({user: user, isCorrection: true, verifiedByUser: false})
    }

    @Get('correction/:id')
    @Roles(RoleEnum.PARTNER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: CorrectionSuccessDto})
    async verifyCorrection(@Req() req, @Param('id') id) {
        let user: User = req.user;
        let transaction = await Transaction.findOne({id: id, tradingPoint: user.tradingPoint});
        if (transaction.verifiedByUser) {
            const dto = new CorrectionSuccessDto();
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
    async correction(@Req() req, @Body() dto: CorrectionDto) {
        let partner: User = req.user;
        let tradingPoint: TradingPoint = partner.tradingPoint;


        let transaction: Transaction = await Transaction.findOne({id: dto.transactionId}, {relations: ['user']});
        let user: User = transaction.user;

        let pool = this.calculateX(transaction.price, transaction.donationPercentage, tradingPoint.defaultVat);

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
            throw new BadRequestException("Transakacja sie nie powiodla. Prosze sprobowac ponownie.")
        }
    }

    @Post()
    @Roles(RoleEnum.PARTNER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: TransactionSuccessDto})
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

            const userXp = await this.calculateXpForUser(user, transaction);
            const tradingPointXp = this.calculateTradingPointXp(currentCart);

            transaction.userXp = userXp;
            transaction.tradingPointXp = tradingPointXp;
            tradingPoint.xp += tradingPointXp;

            user.xp += userXp;

            let pool = this.calculateX(dto.price, dto.donationPercentage, tradingPoint.defaultVat);
            let t = this.calculateY(dto.price, tradingPoint.manipulationFee, tradingPoint.defaultVat);

            transaction.donationValue = t + pool;
            user.personalPool += pool / 2;
            user.donationPool += pool / 2;
            user.collectedMoney += pool;

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

    calculateX(price: number, donationPercentage: number, defaultVat: number): number {
        const vat = defaultVat / 100;
        const netto = (price * vat) / (1 + (vat));
        const cost = netto * (donationPercentage / 100);
        return this.roundToTwo(cost);
    }

    calculateY(price: number, manipulationFee: number, defaultVat: number): number {
        const vat = defaultVat / 100;
        const netto = (price * vat) / (1 + (vat));
        const fee = netto * (manipulationFee / 100);
        return this.roundToTwo(fee)
    }

    roundToTwo(num: number): number {
        // @ts-ignore
        return Number(Math.round(num + 'e2') + 'e-2');
    }

}
