import { ApiModelProperty } from "@nestjs/swagger";
import { Ngo } from "../../database/entity/ngo.entity";

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
}
