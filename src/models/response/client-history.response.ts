import { ApiModelProperty } from "@nestjs/swagger";
import { Transaction } from "../../database/entity/transaction.entity";

export class ClientHistoryResponse {
    @ApiModelProperty()
    donations: any[];
    @ApiModelProperty()
    transactions: Transaction[];
}
