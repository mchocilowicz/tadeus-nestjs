import { Controller, Get, Param } from "@nestjs/common";
import { Transaction } from "../../../database/entity/transaction.entity";
import { TransactionStatus } from "../../../common/enum/status.enum";

@Controller()
export class DashboardTransactionController {

    @Get()
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