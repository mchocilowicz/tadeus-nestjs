import { ApiModelProperty } from "@nestjs/swagger";

export class UserDetailsRequest {
    @ApiModelProperty()
    firstName: string;
    @ApiModelProperty()
    lastName: string;
    @ApiModelProperty()
    bankAccount: number;
    @ApiModelProperty()
    phonePrefix: string;
    @ApiModelProperty()
    phone: string;
    @ApiModelProperty()
    email: string;

    constructor(firstName: string,
                lastName: string,
                bankAccount: number,
                phonePrefix: string,
                email: string,
                phone: string) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.bankAccount = bankAccount;
        this.phonePrefix = phonePrefix;
        this.email = email;
        this.phone = phone;
    }
}
