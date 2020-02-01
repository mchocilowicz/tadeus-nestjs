import {ApiProperty} from "@nestjs/swagger";
import {Phone} from "../../../database/entity/phone.entity";
import {User} from "../../../database/entity/user.entity";

export class UserDetailsResponse {
    @ApiProperty()
    firstName?: string;
    @ApiProperty()
    lastName?: string;
    @ApiProperty()
    bankAccount?: number;
    @ApiProperty()
    phonePrefix: number;
    @ApiProperty()
    phone: number;
    @ApiProperty()
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
