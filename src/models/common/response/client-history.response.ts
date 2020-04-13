import {ApiProperty} from "@nestjs/swagger";
import {Donation} from "../../../entity/donation.entity";
import {TadeusEntity} from "../../../entity/base.entity";

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
