import {ApiProperty} from "@nestjs/swagger";

export class CorrectionRequest {
    @ApiProperty()
    transactionID: string;
    @ApiProperty()
    terminalID: string;
    @ApiProperty()
    userDecision: boolean;
    @ApiProperty()
    isCorrection: boolean;

    constructor(id: string, decision: boolean, price: number, terminal: string, isCorrection: boolean) {
        this.transactionID = id;
        this.userDecision = decision;
        this.isCorrection = isCorrection;
        this.terminalID = terminal;
    }
}
