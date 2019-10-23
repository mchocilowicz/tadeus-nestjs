import { ApiModelProperty } from "@nestjs/swagger";

export class TransactionRequest {
    @ApiModelProperty()
    price: number;
    @ApiModelProperty()
    clientCode: string;
}
