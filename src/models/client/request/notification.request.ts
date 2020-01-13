import { ApiProperty } from "@nestjs/swagger";

export class NotificationRequest {
    @ApiProperty()
    email: string;
    @ApiProperty()
    value: string;

    constructor(email: string, value: string) {
        this.email = email;
        this.value = value;
    }
}
