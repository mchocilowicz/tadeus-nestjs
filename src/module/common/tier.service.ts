import { User } from "../../entity/user.entity";
import { VirtualCard } from "../../entity/virtual-card.entity";
import { TierEnum } from "../../common/enum/tier.enum";

const moment = require('moment');

export class TierService {

    static asignTier(donation: number, user: User, card: VirtualCard): void {
        if (card.expiredAt) {
            const eDate = moment(card.expiredAt)
            const isExpired = moment().isAfter(eDate)

            if (isExpired) {
                card.expiredAt = undefined;
            } else if (card.tier === TierEnum.SILVER && !isExpired && (donation >= 1000 || (user.xp >= 10000 && user.xp < 100000))) {
                card.expiredAt = moment().add(1, 'year');
            } else if (card.tier === TierEnum.GOLD && !isExpired && (donation >= 5000 || (user.xp >= 100000 && user.xp < 1000000))) {
                card.expiredAt = moment().add(2, 'year');
            } else if (card.tier === TierEnum.DIAMOND && !isExpired && (donation >= 20000 || user.xp >= 1000000)) {
                card.expiredAt = moment().add(2, 'year');
            }
        } else {
            if (donation >= 50 && user.xp >= 1000 && user.xp < 10000) {
                card.tier = TierEnum.BLUE;
                card.expiredAt = undefined;
            } else if (donation === 500 || (user.xp >= 10000 && user.xp < 100000)) {
                card.tier = TierEnum.SILVER;
                card.expiredAt = moment().add(1, 'year');
            } else if (donation === 5000 || (user.xp >= 100000 && user.xp < 1000000)) {
                card.tier = TierEnum.GOLD;
                card.expiredAt = moment().add(2, 'year');
            } else if (donation === 20000 || user.xp >= 1000000) {
                card.tier = TierEnum.DIAMOND;
                card.expiredAt = moment().add(2, 'year');
            }
        }

    }

}