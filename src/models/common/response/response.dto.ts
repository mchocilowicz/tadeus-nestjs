import { ApiProperty } from "@nestjs/swagger";

export class ResponseDto<T> {
    @ApiProperty()
    error: boolean = false;
    @ApiProperty()
    data: T;
    @ApiProperty()
    message: string | undefined;

    constructor(data: T) {
        this.data = data;
    }
}
