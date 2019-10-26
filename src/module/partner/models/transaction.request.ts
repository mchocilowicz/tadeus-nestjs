import { ApiModelProperty } from "@nestjs/swagger";

export class TransactionRequest {
    @ApiModelProperty()
    price: number | undefined;
    @ApiModelProperty()
    clientCode: string | undefined;
}
