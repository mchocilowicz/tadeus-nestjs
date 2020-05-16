import {ApiProperty} from "@nestjs/swagger";

export class PayoutRequest {
    @ApiProperty()
    name: string;
    @ApiProperty()
    surName: string;
    @ApiProperty()
    bankAccount: number;


    constructor(firstName: string,
                lastName: string,
                bankAccount: number) {
        this.name = firstName;
        this.surName = lastName;
        this.bankAccount = bankAccount;
    }
}
