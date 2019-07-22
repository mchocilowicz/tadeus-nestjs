import { ApiModelProperty } from "@nestjs/swagger";

export class TransactionSuccessDto {
    @ApiModelProperty()
    date: string;
    @ApiModelProperty()
    price: number;
    @ApiModelProperty()
    xp: number;
}


export class CorrectionDto {
    @ApiModelProperty()
    transactionId: string
}

export class CorrectionSuccessDto {
    @ApiModelProperty()
    date: string;
    @ApiModelProperty()
    price: number;
    @ApiModelProperty()
    xp: number;
}
