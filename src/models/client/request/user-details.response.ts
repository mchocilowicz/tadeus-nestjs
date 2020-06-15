import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../../entity/user.entity";

export class UserDetailsResponse {
    @ApiProperty()
    firstName?: string;
    @ApiProperty()
    lastName?: string;
    @ApiProperty()
    bankAccount?: string;
    @ApiProperty()
    phonePrefix: number = 48;
    @ApiProperty()
    phone?: number;
    @ApiProperty()
    email?: string;

    constructor(details: User, phone?: number) {
        this.firstName = details.name;
        this.lastName = details.lastName;
        this.bankAccount = details.bankAccount;
        this.phone = phone;
        this.email = details.email;
    }
}
