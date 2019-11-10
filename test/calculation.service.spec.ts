import {CalculationService} from "../src/common/service/calculation.service";
import {Transaction} from "../src/database/entity/transaction.entity";
import {TradingPoint} from "../src/database/entity/trading-point.entity";

describe('CalculationService', () => {
    let calculationService: CalculationService;

    beforeEach(() => {
        calculationService = new CalculationService();
    });

    describe('partnerXp', () => {
        // For the first BONUS transaction of the day: +50 XP
        // For each of the following 20 transactions + 20 XP
        // Every 20th transaction: additional + 50 XP
        // Every 50th transaction: additional + 200 XP

        it('first transaction', () => {

        });
    });

    describe('userXp', () => {
        // For first BONUS transaction of the day: +10 XP
        // For second and every following transaction in the same store, same day: +10 XP
        // For every following transaction the same day (different store) – BONUS goes twice as much
        // as the one before:
        //     - For 2nd + 20 XP
        //     - For 3rd + 40 XP
        //     - For 4th + 80 XP
        //     - For 5th + 160 XP

        it("first transaction", () => {
            let t = new Transaction();
            let tp = new TradingPoint();
            tp.id = '1';
            t.tradingPoint = tp;
            let xp = calculationService.calculateUserXp([t], tp, 0);
            expect(xp).toBe(10)
        });

        it('second transaction in same store', () => {
            let t = new Transaction();
            let tp = new TradingPoint();
            tp.id = '1';
            t.tradingPoint = tp;
            let xp = calculationService.calculateUserXp([t, t], tp, 10);
            expect(xp).toBe(10)
        });

        it('third transaction in same store', () => {
            let t = new Transaction();
            let tp = new TradingPoint();
            tp.id = '1';
            t.tradingPoint = tp;
            let xp = calculationService.calculateUserXp([t, t, t], tp, 20);
            expect(xp).toBe(10)
        });

        it('second transaction in other store', () => {
            let t = createTransactions(2);
            let xp = calculationService.calculateUserXp(t, t[0].tradingPoint, 10);
            expect(xp).toBe(20)
        });

        it('transaction two different stores', () => {
            let t = createTransactions(3);
            let xp = calculationService.calculateUserXp(t, t[0].tradingPoint, 30);
            expect(xp).toBe(40)
        });

        it('transaction three different stores', () => {
            let t = createTransactions(4);
            let xp = calculationService.calculateUserXp(t, t[0].tradingPoint, 70);
            expect(xp).toBe(80)
        });

        it('transaction four different stores', () => {
            let t = createTransactions(5);
            let xp = calculationService.calculateUserXp(t, t[0].tradingPoint, 80);
            expect(xp).toBe(160)
        });

        function createTransactions(count: number) {
            let list = [];
            for (let i = 0; i < count; i++) {
                let t = new Transaction();
                let tp = new TradingPoint();
                tp.id = '' + i;
                t.tradingPoint = tp;
                list.push(t)
            }
            return list;
        }
    });
});
