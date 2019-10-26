import { ApiModelProperty } from "@nestjs/swagger";
import { UserDetails } from "../../../../database/entity/user-details.entity";
import { Phone } from "../../../../database/entity/phone.entity";

export class UserDetailsResponse {
    @ApiModelProperty()
    firstName: string;
    @ApiModelProperty()
    lastName?: string;
    @ApiModelProperty()
    bankAccount?: number;
    @ApiModelProperty()
    phonePrefix: string;
    @ApiModelProperty()
    phone: string;
    @ApiModelProperty()
    email: string;

    constructor(details: UserDetails, phone: Phone) {
        this.firstName = details.name;
        this.lastName = details.lastName;
        this.bankAccount = details.bankAccount;
        this.phone = phone.value;
        this.phonePrefix = phone.prefix.value;
        this.email = details.email;
    }
}
