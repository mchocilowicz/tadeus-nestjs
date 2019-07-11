import { ApiModelProperty } from "@nestjs/swagger";
import { Ngo } from "../entity/ngo.entity";
import { Transaction } from "../entity/transaction.entity";

export class ClientHistoryDto {
    @ApiModelProperty()
    ngoList: Ngo[];
    @ApiModelProperty()
    transactionList: Transaction[];
}
