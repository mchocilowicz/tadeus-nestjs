import { ApiModelProperty } from "@nestjs/swagger";

export class PartnerDetailsResponse {
    @ApiModelProperty()
    id: string;
    @ApiModelProperty()
    name: string;
    @ApiModelProperty()
    city: string;
    @ApiModelProperty()
    address: string;
    @ApiModelProperty()
    postCode: string;
    @ApiModelProperty()
    xp: string;
}
