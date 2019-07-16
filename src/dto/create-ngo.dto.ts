import { City } from "../database/entity/city.entity";
import { NgoType } from "../database/entity/ngo-type.entity";
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
    @ApiModelProperty()
    bankNumber: string;
    @ApiModelProperty()
    email: string;
    @ApiModelProperty()
    phone: string;
}
