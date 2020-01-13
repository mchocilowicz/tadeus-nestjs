import { ApiProperty } from "@nestjs/swagger";

export class FirebaseTokenRequest {
    @ApiProperty()
    token: string;
    @ApiProperty()
    platform: string;

    constructor(token: string, platform: string) {
        this.token = token;
        this.platform = platform;
    }
}
