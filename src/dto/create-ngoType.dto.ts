import { ApiModelProperty } from "@nestjs/swagger";

export class CreateNgoTypeDto {
    @ApiModelProperty()
    name: string;
}
