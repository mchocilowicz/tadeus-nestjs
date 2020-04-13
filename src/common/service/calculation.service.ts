import {Injectable} from "@nestjs/common";
import {Transaction} from "../../entity/transaction.entity";
import {TradingPoint} from "../../entity/trading-point.entity";

const _ = require('lodash');

@Injectable()
export class CalculationService {

    async calculateXpForUser(userId: string, xp: number, currentTransaction: Transaction, ignoreTransaction?: Transaction): Promise<number> {
        let transactions: Transaction[] = await Transaction.findByUserMadeToday(userId);

        transactions.push(currentTransaction);
        if (ignoreTransaction) {
            transactions = transactions.filter((t: Transaction) => t.id !== ignoreTransaction.id)
        }

        return this.calculateUserXp(transactions, currentTransaction.tradingPoint, xp)
    }

    async calculateXpForPartner(partnerId: string, currentTransaction: Transaction, ignoreTransaction?: Transaction): Promise<number> {
        let transactions: Transaction[] = await Transaction.findByTradingPointMadeToday(partnerId);

        transactions.push(currentTransaction);

        if (ignoreTransaction) {
            transactions = transactions.filter((t: Transaction) => t.id !== ignoreTransaction.id)
        }
        return this.calculateTradingPointXp(transactions)
    }

    calculateUserXp(transactions: Transaction[], tradingPoint: TradingPoint, lastUserXp: number): number {
        let transactionsInSameShop = transactions.filter((t: Transaction) => t.tradingPoint.id === tradingPoint.id);
        let transactionsInOtherShops = _.uniqBy(transactions.filter((t: Transaction) => t.tradingPoint.id !== tradingPoint.id), 'tradingPoint.id');

        let xp = 0;

        if (transactionsInSameShop.length > 1) {
            xp += 10;
        }
        if (transactionsInOtherShops.length > 0) {
            let currentXp = 0;
            let index = 1;
            for (let transaction in transactionsInOtherShops) {
                if (index === 1) {
                    currentXp = 20;
                } else {
                    currentXp = 2 * currentXp;
                }
                index++;
            }
            xp += currentXp;
        }
        let nexXp = xp + lastUserXp;
        return transactions.length === 1 ? 10 : nexXp - lastUserXp;
    }

    calculateTradingPointXp(transactions: Transaction[]): number {
        const defaultXp = 20;

        if (transactions.length === 1) {
            return 50;
        }

        if (transactions.length < 20) {
            return defaultXp;
        } else if ((transactions.length % 50) === 0) {
            return defaultXp + 200;
        } else if ((transactions.length % 20) === 0) {
            return defaultXp + 50;
        } else {
            return defaultXp;
        }

    }

    calculateCost(price: number, donationPercentage: number, defaultVat: number): number {
        const vat = defaultVat / 100;
        const netto = price / (1 + this.roundToTwo(vat));
        const cost = this.roundToTwo(netto) * (donationPercentage / 100);
        return this.roundToTwo(cost);
    }

    roundToTwo(num: number): number {
        return Math.round((num + Number.EPSILON) * 100) / 100
    }
}
