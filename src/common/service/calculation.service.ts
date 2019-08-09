import { Injectable } from "@nestjs/common";
import { Transaction } from "../../database/entity/transaction.entity";
import { Cart } from "../../database/entity/cart.entity";

@Injectable()
export class CalculationService {

    calculate(transactions: any[], currenctTransaction: Transaction): number {
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

    calculateTradingPointXp(cart: Cart): number {
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
