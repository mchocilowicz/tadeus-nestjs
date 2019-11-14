import { ApiModelProperty } from "@nestjs/swagger";
import { Phone } from "../../../database/entity/phone.entity";
import { User } from "../../../database/entity/user.entity";

export class UserDetailsResponse {
    @ApiModelProperty()
    firstName?: string;
    @ApiModelProperty()
    lastName?: string;
    @ApiModelProperty()
    bankAccount?: number;
    @ApiModelProperty()
    phonePrefix: number;
    @ApiModelProperty()
    phone: number;
    @ApiModelProperty()
    email?: string;

    constructor(details: User, phone: Phone) {
        this.firstName = details.name;
        this.lastName = details.lastName;
        this.bankAccount = details.bankAccount;
        this.phone = phone.value;
        this.phonePrefix = phone.prefix.value;
        this.email = details.email;
    }
}
