import {User} from "../../../entity/user.entity";

export class UserViewResponse {
    id: string;
    ID: string;
    name?: string;
    prefix: number | null;
    phone: number | null;
    donationPool: number;
    collectedMoney: number;
    updateAt: Date;
    personalPool: number;
    xp: number;
    currentNgo: string;
    lastNgo: string;
    transactions?: UserTransactionResponse[];
    status: string;

    constructor(user: User) {
        this.id = user.id;
        this.ID = user.account.ID;
        this.prefix = user.phone ? user.phone.prefix.value : null;
        this.phone = user.phone ? user.phone.value : null;
        this.donationPool = user.card.donationPool;
        this.collectedMoney = user.collectedMoney;
        this.updateAt = user.updatedAt;
        this.personalPool = user.card.personalPool;
        this.xp = user.xp;
        this.currentNgo = user.ngo ? user.ngo.name : "";
        this.lastNgo = "";
        this.status = user.account.status;
        this.name = user.name;
        this.transactions = user.transactions?.map(t => {
            return new UserTransactionResponse(t.isCorrection ? "CORRECTION" : "TRANSACTION", t.createdAt, t.price, t.userXp)
        });

        if (user.donations) {
            let donation = user.donations.pop();
            if (donation && donation.ngo) {
                this.lastNgo = donation ? donation.ngo.name : "";
            }
        }
    }
}

export class UserTransactionResponse {
    type: string;
    createdAt: Date;
    price: number;
    xp: number;

    constructor(type: string, createdAt: Date, price: number, xp: number) {
        this.type = type;
        this.createdAt = createdAt;
        this.price = price;
        this.xp = xp;
    }
}