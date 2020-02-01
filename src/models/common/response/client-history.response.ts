import {ApiProperty} from "@nestjs/swagger";
import {Donation} from "../../../database/entity/donation.entity";
import {TadeusEntity} from "../../../database/entity/base.entity";

export class ClientHistoryResponse {
    @ApiProperty()
    donations?: Donation[];
    @ApiProperty()
    transactions?: TadeusEntity[];

    constructor(donations?: Donation[], transactions?: TadeusEntity[]) {
        this.transactions = transactions;
        this.donations = donations;
    }
}
