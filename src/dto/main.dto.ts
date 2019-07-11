import { ApiModelProperty } from "@nestjs/swagger";
import { Ngo } from "../entity/ngo.entity";

export class MainDto {
    @ApiModelProperty()
    donation: number = 0;
    @ApiModelProperty()
    personal: number = 0;
    @ApiModelProperty()
    ngo: Ngo = null;
    @ApiModelProperty()
    collectedMoney: number = 0;
    @ApiModelProperty()
    xp: number = 0;
}
