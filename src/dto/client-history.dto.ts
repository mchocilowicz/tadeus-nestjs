import { ApiModelProperty } from "@nestjs/swagger";
import { Ngo } from "../database/entity/ngo.entity";
import { Transaction } from "../database/entity/transaction.entity";

export class ClientHistoryDto {
    @ApiModelProperty()
    ngoList: Ngo[];
    @ApiModelProperty()
    transactionList: Transaction[];
}
