import { ApiModelProperty } from "@nestjs/swagger";

export class VerifyUserDto {
    @ApiModelProperty({required: true})
    readonly phone: string;
    @ApiModelProperty({required: true})
    readonly code: number;
}
