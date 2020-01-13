import { ApiProperty } from "@nestjs/swagger";

export class CorrectionRequest {
    @ApiProperty()
    transactionID: string;
    @ApiProperty()
    terminalID: string;
    @ApiProperty()
    correctionAccepted: boolean;
    @ApiProperty()
    price: number;

    constructor(id: string, decision: boolean, price: number, terminal: string) {
        this.transactionID = id;
        this.correctionAccepted = decision;
        this.price = price;
        this.terminalID = terminal;
    }
}
