import { ApiModelProperty } from "@nestjs/swagger";

export class PayoutRequest {
    @ApiModelProperty()
    name: string;
    @ApiModelProperty()
    surName: string;
    @ApiModelProperty()
    bankAccount: string;


    constructor(firstName: string,
                lastName: string,
                bankAccount: string) {
        this.name = firstName;
        this.surName = lastName;
        this.bankAccount = bankAccount;
    }
}
