import { ApiProperty } from "@nestjs/swagger";

export class CorrectionRequest {
    @ApiProperty()
    transactionID: string;
    @ApiProperty()
    terminalID: string;
    @ApiProperty()
    userDecision: boolean;

    constructor(id: string, decision: boolean, price: number, terminal: string) {
        this.transactionID = id;
        this.userDecision = decision;
        this.terminalID = terminal;
    }
}
