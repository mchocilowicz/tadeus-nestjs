import { ApiProperty } from "@nestjs/swagger";
import { Ngo } from "../../../entity/ngo.entity";
import { VirtualCard } from "../../../entity/virtual-card.entity";
import { User } from "../../../entity/user.entity";
import { TierEnum } from "../../../common/enum/tier.enum";

export class MainResponse {
    @ApiProperty()
    name?: string;
    @ApiProperty()
    donationPool: number;
    @ApiProperty()
    personalPool: number;
    @ApiProperty()
    ngo?: Ngo;
    @ApiProperty()
    collectedMoney: number;
    @ApiProperty()
    xp: number;
    @ApiProperty()
    userActivity: number;
    @ApiProperty()
    selfPayoutDate: Date;
    @ApiProperty()
    selfPayoutPossible: boolean;
    @ApiProperty()
    activeCard: boolean = false;
    @ApiProperty()
    tier: TierEnum;
    @ApiProperty()
    canChangeNgo: boolean

    constructor(user: User, card: VirtualCard, activity: number, payout: Date, possible: boolean, ngoChange: boolean) {
        this.ngo = user.ngo;
        this.donationPool = card.donationPool;
        this.personalPool = card.personalPool;
        this.collectedMoney = user.collectedMoney;
        this.xp = user.xp;
        this.name = user.isAnonymous ? 'Anonimowy' : user.name;
        this.tier = card.tier;
        this.userActivity = activity;
        this.selfPayoutDate = payout;
        this.selfPayoutPossible = possible;
        this.activeCard = card.status === 'ACTIVE';
        this.canChangeNgo = ngoChange;
    }
}
