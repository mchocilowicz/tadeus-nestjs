import { ApiModelProperty } from "@nestjs/swagger";
import { Ngo } from "../../database/entity/ngo.entity";
import { User } from "../../database/entity/user.entity";

export class MainResponse {
    @ApiModelProperty()
    name: string = '';
    @ApiModelProperty()
    donationPool: number = 0;
    @ApiModelProperty()
    personalPool: number = 0;
    @ApiModelProperty()
    ngo: Ngo = null;
    @ApiModelProperty()
    collectedMoney: number = 0;
    @ApiModelProperty()
    xp: number = 0;

    constructor(user: User) {
        this.ngo = user.details.ngo;
        this.donationPool = user.card.donationPool;
        this.collectedMoney = user.details.collectedMoney;
        this.xp = user.details.xp;
        this.name = user.details.name;
    }
}
