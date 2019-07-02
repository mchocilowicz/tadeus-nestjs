import { City } from "../entity/city.entity";
import { NgoType } from "../entity/ngo-type.entity";
import { ApiModelProperty } from "@nestjs/swagger";

export class CreateNgoDto {
    @ApiModelProperty()
    city: City;
    @ApiModelProperty()
    type: NgoType;
    @ApiModelProperty()
    location: string;
    @ApiModelProperty()
    name: string;
    @ApiModelProperty()
    address: string;
}
