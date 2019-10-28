import { ApiModelProperty } from "@nestjs/swagger";
import { Donation } from "../../database/entity/donation.entity";
import { TadeusEntity } from "../../database/entity/base.entity";

export class ClientHistoryResponse {
    @ApiModelProperty()
    donations?: Donation[];
    @ApiModelProperty()
    transactions?: TadeusEntity[];

    constructor(donations?: Donation[], transactions?: TadeusEntity[]) {
        this.transactions = transactions;
        this.donations = donations;
    }
}
