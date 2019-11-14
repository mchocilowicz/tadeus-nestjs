import { ApiModelProperty } from "@nestjs/swagger";

export class CityResponse {
    @ApiModelProperty()
    id: string;
    @ApiModelProperty()
    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}
