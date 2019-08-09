import { ApiModelProperty } from "@nestjs/swagger";

export class CityRequest {
    @ApiModelProperty({required: true})
    name: string;
}
