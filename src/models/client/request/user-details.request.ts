import { ApiProperty } from "@nestjs/swagger";

export class UserDetailsRequest {
    @ApiProperty()
    firstName: string;
    @ApiProperty()
    lastName: string;
    @ApiProperty()
    bankAccount: string;
    @ApiProperty()
    phonePrefix: number;
    @ApiProperty()
    phone: number;
    @ApiProperty()
    email: string;

    constructor(firstName: string,
                lastName: string,
                bankAccount: string,
                phonePrefix: number,
                email: string,
                phone: number) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.bankAccount = bankAccount;
        this.phonePrefix = phonePrefix;
        this.email = email;
        this.phone = phone;
    }
}
