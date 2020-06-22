import {Step} from "../../common/enum/status.enum";
import {Terminal} from "../../entity/terminal.entity";
import {TradingPoint} from "../../entity/trading-point.entity";
import {Transaction} from "../../entity/transaction.entity";

export class TransactionHistoryResponse {
    donationPercentage: number;
    provisionPercentage: number;
    paymentValue: number;
    vat: number;
    provision: number;
    poolValue: number;
    donationPool: number;
    personalPool: number;
    userXp: number;
    tradingPointXp: number;
    ngoDonation: number;
    price: number;
    status: string;
    isCorrection: boolean;
    isPaid: boolean;
    class: string;
    terminal?: TransactionTerminalHistoryResponse;
    tradingPoint?: TransactionTradingPointResponse;
    ID: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    correction?: TransactionHistoryResponse;

    constructor(transaction: Transaction) {
        this.donationPercentage = transaction.donationPercentage
        this.provisionPercentage = transaction.provisionPercentage
        this.paymentValue = transaction.paymentValue
        this.vat = transaction.vat
        this.provision = transaction.provision
        this.poolValue = transaction.poolValue
        this.donationPool = transaction.donationPool
        this.personalPool = transaction.personalPool
        this.userXp = transaction.userXp
        this.tradingPointXp = transaction.tradingPointXp
        this.ngoDonation = transaction.ngoDonation
        this.price = transaction.price
        this.status = transaction.status
        this.isCorrection = transaction.isCorrection
        this.isPaid = transaction.isPaid
        this.class = transaction.class
        this.terminal = transaction.terminal
        this.tradingPoint = transaction.tradingPoint
        this.ID = transaction.ID
        this.id = transaction.id
        this.createdAt = transaction.createdAt
        this.updatedAt = transaction.updatedAt
        if (transaction.correction) {
            this.correction = new TransactionHistoryResponse(transaction.correction)
        }
        if (transaction.terminal) {
            this.terminal = new TransactionTerminalHistoryResponse(transaction.terminal)
        }
        if (transaction.tradingPoint) {
            this.tradingPoint = new TransactionTradingPointResponse(transaction.tradingPoint)
        }
    }

}

class TransactionTerminalHistoryResponse {
    step: Step;
    isMain: boolean;
    ID: string;
    name?: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(terminal: Terminal) {
        this.step = terminal.step;
        this.isMain = terminal.isMain;
        this.ID = terminal.ID;
        this.name = terminal.name;
        this.id = terminal.id;
        this.createdAt = terminal.createdAt;
        this.updatedAt = terminal.updatedAt;
    }
}

class TransactionTradingPointResponse {
    donationPercentage: number;
    vat: number;
    fee: number;
    price: number;
    image: string;
    xp: number;
    active: boolean;
    ID: string;
    name: string;
    email: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description?: string;
    closedAt?: Date;

    constructor(tradingPoint: TradingPoint) {
        this.donationPercentage = tradingPoint.donationPercentage;
        this.vat = tradingPoint.vat;
        this.fee = tradingPoint.fee;
        this.price = tradingPoint.price;
        this.image = tradingPoint.image;
        this.xp = tradingPoint.xp;
        this.active = tradingPoint.active;
        this.ID = tradingPoint.ID;
        this.name = tradingPoint.name;
        this.email = tradingPoint.email;
        this.id = tradingPoint.id;
        this.createdAt = tradingPoint.createdAt;
        this.updatedAt = tradingPoint.updatedAt;
        this.description = tradingPoint.description;
        this.closedAt = tradingPoint.closedAt;
    }
}