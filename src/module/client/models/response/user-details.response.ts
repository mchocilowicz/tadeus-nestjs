import { ApiModelProperty } from "@nestjs/swagger";
import { User } from "../../../../database/entity/user.entity";

export class UserDetailsResponse {
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

    constructor(user: User) {
        this.firstName = user.details.name;
        this.lastName = user.details.lastName;
        this.bankAccount = user.details.bankAccount;
        this.phone = user.phone;
        this.phonePrefix = user.phonePrefix;
        this.email = user.email;
    }
}
