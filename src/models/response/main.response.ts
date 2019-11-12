import {ApiModelProperty} from "@nestjs/swagger";
import {Ngo} from "../../database/entity/ngo.entity";
import {VirtualCard} from "../../database/entity/virtual-card.entity";
import {User} from "../../database/entity/user.entity";

export class MainResponse {
    @ApiModelProperty()
    name?: string;
    @ApiModelProperty()
    donationPool: number;
    @ApiModelProperty()
    personalPool: number;
    @ApiModelProperty()
    ngo?: Ngo;
    @ApiModelProperty()
    collectedMoney: number;
    @ApiModelProperty()
    xp: number;
    @ApiModelProperty()
    userActivity: number;

    constructor(details: User, card: VirtualCard, activity: number) {
        this.ngo = details.ngo;
        this.donationPool = card.donationPool;
        this.personalPool = card.personalPool;
        this.collectedMoney = details.collectedMoney;
        this.xp = details.xp;
        this.name = details.name;
        this.userActivity = activity;
    }
}
