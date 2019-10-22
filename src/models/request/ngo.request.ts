import { ApiModelProperty } from "@nestjs/swagger";
import { City } from "../../database/entity/city.entity";
import { NgoType } from "../../database/entity/ngo-type.entity";

export class NgoRequest {
    @ApiModelProperty({required: true})
    city: City;
    @ApiModelProperty({required: true})
    type: NgoType;
    @ApiModelProperty({required: true})
    latitude: number;
    @ApiModelProperty({required: true})
    longitude: number;
    @ApiModelProperty({required: true})
    name: string;
    @ApiModelProperty({required: true})
    longName: string;
    @ApiModelProperty({required: true})
    description: string;
    @ApiModelProperty({required: true})
    address: string;
    @ApiModelProperty({required: true})
    bankNumber: string;
    @ApiModelProperty({required: true})
    email: string;
    @ApiModelProperty({required: true})
    phone: string;
    @ApiModelProperty({required: true})
    phonePrefix: string;
}
