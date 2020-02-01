import {User} from "../../../database/entity/user.entity";

export class UserViewResponse {
    id: string;
    ID: string;
    phonePrefix: number | null;
    phone: number | null;
    donationPool: number;
    collectedMoney: number;
    updateAt: Date;
    personalPool: number;
    xp: number;
    currentNgo: string;
    lastNgo: string;

    constructor(user: User) {
        this.id = user.id;
        this.ID = user.account.ID;
        this.phonePrefix = user.phone ? user.phone.prefix.value : null;
        this.phone = user.phone ? user.phone.value : null;
        this.donationPool = user.card.donationPool;
        this.collectedMoney = user.collectedMoney;
        this.updateAt = user.updatedAt;
        this.personalPool = user.card.personalPool;
        this.xp = user.xp;
        this.currentNgo = user.ngo ? user.ngo.name : "";
        this.lastNgo = "";

        if (user.donations) {
            let donation = user.donations.pop();
            if (donation && donation.ngo) {
                this.lastNgo = donation ? donation.ngo.name : "";
            }
        }
    }
}
