import {Controller, Get, Param, UseGuards} from "@nestjs/common";
import {Transaction} from "../../../database/entity/transaction.entity";
import {TransactionStatus} from "../../../common/enum/status.enum";
import {ApiBearerAuth, ApiHeader} from "@nestjs/swagger";
import {Roles} from "../../../common/decorators/roles.decorator";
import {RoleEnum} from "../../../common/enum/role.enum";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";
import {Const} from "../../../common/util/const";

@Controller()
export class DashboardTransactionController {

    @Get()
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async getTransactions() {
        return await Transaction.createQueryBuilder('t')
            .leftJoinAndSelect('t.user', 'u')
            .leftJoinAndSelect('u.account', 'account')
            .leftJoinAndSelect('t.terminal', 'terminal')
            .leftJoinAndSelect('t.tradingPoint', 'point')
            .leftJoinAndSelect('t.ngo', 'ngo')
            .where('t.status = :status', {status: TransactionStatus.ACCEPTED})
            .select('ngo.ID', 'ngoID')
            .addSelect('account.ID', 'userID')
            .addSelect('t.ID', 'transactionID')
            .addSelect('terminal.ID', 'terminalID')
            .addSelect('point.ID', 'tradingPointID')
            .addSelect('t.createdAt', 'createdAt')
            .getRawMany();
    }

    @Get(':ID')
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async getTransaction(@Param('ID')id: string) {
        return await Transaction.createQueryBuilder('t')
            .leftJoinAndSelect('t.user', 'u')
            .leftJoinAndSelect('u.account', 'account')
            .leftJoinAndSelect('t.terminal', 'terminal')
            .leftJoinAndSelect('t.tradingPoint', 'point')
            .leftJoinAndSelect('t.ngo', 'ngo')
            .where('t.status = :status', {status: TransactionStatus.ACCEPTED})
            .andWhere('t.ID = :ID', {ID: id})
            .select('ngo.ID', 'ngoID')
            .addSelect('account.ID', 'userID')
            .addSelect('t.ID', 'transactionID')
            .addSelect('terminal.ID', 'terminalID')
            .addSelect('point.ID', 'tradingPointID')
            .addSelect('t.userXp', 'userXp')
            .addSelect('t.isPaid', 'isPaid')
            .addSelect('t.ngoDonation', 'ngoDonation')
            .addSelect('t.price', 'price')
            .addSelect('t.donationPercentage', 'donationPercentage')
            .addSelect('t.provisionPercentage', 'provisionPercentage')
            .addSelect('t.paymentValue', 'paymentValue')
            .addSelect('t.vat', 'vat')
            .addSelect('t.provision', 'provision')
            .addSelect('t.donationPool', 'donationPool')
            .addSelect('t.personalPool', 'personalPool')
            .addSelect('t.tradingPointXp', 'tradingPointXp')
            .addSelect('t.createdAt', 'createdAt')
            .getRawOne();
    }
}