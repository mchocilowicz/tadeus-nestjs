import { ApiModelProperty } from "@nestjs/swagger";
import { Transaction } from "../../database/entity/transaction.entity";
import { User } from "../../database/entity/user.entity";
import { Donation } from "../../database/entity/donation.entity";

export class ClientHistoryResponse {
    @ApiModelProperty()
    donations?: Donation[];
    @ApiModelProperty()
    transactions?: Transaction[];

    constructor(user: User) {
        this.transactions = user.transactions;
        this.donations = user.donations;
    }
}
