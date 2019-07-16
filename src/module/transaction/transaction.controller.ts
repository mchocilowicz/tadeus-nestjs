import { BadRequestException, Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
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

@Controller()
export class TransactionController {

    @Post()
    @Roles(RoleEnum.PARTNER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async saveTransaction(@Req() req, @Body() dto: TransactionDto) {
        let partner: User = req.user;
        const date = new Date().toISOString().slice(0,10);
        let currentCart: Cart = await Cart.findOne({tradingPoint: partner.tradingPoint});
        let user: User = await createQueryBuilder('User')
            .leftJoinAndSelect('User.virtualCard', 'virtualCard')
            .leftJoinAndSelect('User.ngo', 'ngo')
            .where('virtualCard.code = :code', {code: dto.clientCode}).execute();
        if(!currentCart) {
            currentCart = new Cart();
            currentCart.tradingPoint = partner.tradingPoint;
        }
        let transaction: Transaction = new Transaction();
        transaction.user = user;
        transaction.ngo = user.ngo;
        transaction.tradingPoint = partner.tradingPoint;
        transaction.price = dto.price;
        transaction.xp = 10;
        transaction.recipeCode = 'FV-12345'; // TODO: Auto Create
        transaction.donationPercentage = dto.donationPercentage;
        transaction.donationValue = dto.price;

        try {
            if (!currentCart.id) {
                transaction.cart = await currentCart.save();
            } else {
                transaction.cart = currentCart;
            }
            if (dto.isCorrection) {
                user.xp += 123;
                user.personalPool += dto.price;
                user.donationPool += dto.price;
                user.collectedMoney += dto.price;

                await transaction.save();
                await user.save();

                let result = new TransactionSuccessDto();
                result.date = date;
                result.price = dto.price;
                result.xp = 123;
                return result;
            } else {
                // Korekta
                user.xp -= 123;
                user.personalPool -= dto.price;
                user.donationPool -= dto.price;
                user.collectedMoney -= dto.price;

                await transaction.save();
                await user.save();

                return "TODO";
            }
        } catch (e) {
            throw new BadRequestException("Please try again.")
        }
    }
}
