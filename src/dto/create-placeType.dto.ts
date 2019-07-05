import { ApiModelProperty } from "@nestjs/swagger";

export class CreatePlaceTypeDto {
    @ApiModelProperty()
    name: string
}
