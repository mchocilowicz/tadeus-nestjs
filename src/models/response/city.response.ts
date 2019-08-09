import { ApiModelProperty } from "@nestjs/swagger";

export class CityResponse {
    @ApiModelProperty()
    id: string;
    @ApiModelProperty()
    name: string
}
