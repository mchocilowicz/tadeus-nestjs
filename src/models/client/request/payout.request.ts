import { ApiProperty } from "@nestjs/swagger";

export class PayoutRequest {
    @ApiProperty()
    name: string;
    @ApiProperty()
    surName: string;
    @ApiProperty()
    bankAccount: string;


    constructor(firstName: string,
                lastName: string,
                bankAccount: string) {
        this.name = firstName;
        this.surName = lastName;
        this.bankAccount = bankAccount;
    }
}
