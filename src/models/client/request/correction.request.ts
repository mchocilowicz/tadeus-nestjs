import {ApiModelProperty} from "@nestjs/swagger";

export class CorrectionRequest {
    @ApiModelProperty()
    transactionID: string;
    @ApiModelProperty()
    terminalID: string;
    @ApiModelProperty()
    correctionAccepted: boolean;
    @ApiModelProperty()
    price: number;

    constructor(id: string, decision: boolean, price: number, terminal: string) {
        this.transactionID = id;
        this.correctionAccepted = decision;
        this.price = price;
        this.terminalID = terminal;
    }
}
