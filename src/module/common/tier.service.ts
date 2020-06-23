import { User } from "../../entity/user.entity";
import { VirtualCard } from "../../entity/virtual-card.entity";
import { Tier } from "../../common/enum/tier";

const moment = require('moment');

export class TierService {

    static asignTier(donation: number, user: User, card: VirtualCard): void {
        if (card.expiredAt) {
            const eDate = moment(card.expiredAt)
            const isExpired = moment().isAfter(eDate)

            if (isExpired) {
                card.expiredAt = undefined;
            } else if (card.tier === Tier.SILVER && !isExpired && (donation >= 1000 || (user.xp >= 10000 && user.xp < 100000))) {
                card.expiredAt = moment().add(1, 'year');
            } else if (card.tier === Tier.GOLD && !isExpired && (donation >= 5000 || (user.xp >= 100000 && user.xp < 1000000))) {
                card.expiredAt = moment().add(2, 'year');
            } else if (card.tier === Tier.DIAMOND && !isExpired && (donation >= 20000 || user.xp >= 1000000)) {
                card.expiredAt = moment().add(2, 'year');
            }
        } else {
            if (donation >= 50 && user.xp >= 1000 && user.xp < 10000) {
                card.tier = Tier.BLUE;
                card.expiredAt = undefined;
            } else if (donation === 500 || (user.xp >= 10000 && user.xp < 100000)) {
                card.tier = Tier.SILVER;
                card.expiredAt = moment().add(1, 'year');
            } else if (donation === 5000 || (user.xp >= 100000 && user.xp < 1000000)) {
                card.tier = Tier.GOLD;
                card.expiredAt = moment().add(2, 'year');
            } else if (donation === 20000 || user.xp >= 1000000) {
                card.tier = Tier.DIAMOND;
                card.expiredAt = moment().add(2, 'year');
            }
        }

    }

}