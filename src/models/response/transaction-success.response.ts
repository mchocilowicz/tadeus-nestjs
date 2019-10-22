import { ApiModelProperty } from "@nestjs/swagger";

export class TransactionSuccessResponse {
    @ApiModelProperty()
    date: string;
    @ApiModelProperty()
    price: number;
    @ApiModelProperty()
    xp: number;
}

export class CorrectionResponse {
    @ApiModelProperty()
    transactionId: string;
    @ApiModelProperty()
    price: number;
}

export class CorrectionSuccessResponse {
    @ApiModelProperty()
    date: string;
    @ApiModelProperty()
    price: number;
    @ApiModelProperty()
    xp: number;
}
