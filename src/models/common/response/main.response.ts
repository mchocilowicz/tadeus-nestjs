import { ApiProperty } from "@nestjs/swagger";
import { Ngo } from "../../../database/entity/ngo.entity";
import { VirtualCard } from "../../../database/entity/virtual-card.entity";
import { User } from "../../../database/entity/user.entity";

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

    constructor(user: User, card: VirtualCard, activity: number, payout: Date, possible: boolean) {
        this.ngo = user.ngo;
        this.donationPool = card.donationPool;
        this.personalPool = card.personalPool;
        this.collectedMoney = user.collectedMoney;
        this.xp = user.xp;
        this.name = user.isAnonymous ? 'Anonimowy' : user.name;
        this.userActivity = activity;
        this.selfPayoutDate = payout;
        this.selfPayoutPossible = possible;
        this.activeCard = card.status === 'ACTIVE';
    }
}
