import { ApiModelProperty } from "@nestjs/swagger";

export class PayoutRequest {
    @ApiModelProperty()
    name: string;
    @ApiModelProperty()
    sureName: string;
    @ApiModelProperty()
    bankAccount: string;


    constructor(firstName: string,
                lastName: string,
                bankAccount: string) {
        this.name = firstName;
        this.sureName = lastName;
        this.bankAccount = bankAccount;
    }
}
