import { ApiModelProperty } from "@nestjs/swagger";
import { Ngo } from "../entity/ngo.entity";

export class MainDto {
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
}
