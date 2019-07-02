import { ApiModelProperty } from "@nestjs/swagger";

export class VerifyUserDto {
    @ApiModelProperty()
    readonly phone: string;
    @ApiModelProperty()
    readonly code: number;
}
