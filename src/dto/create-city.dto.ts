import { ApiModelProperty } from "@nestjs/swagger";

export class CreateCityDto {
    @ApiModelProperty()
    name: string;
    @ApiModelProperty()
    location: string;
}
