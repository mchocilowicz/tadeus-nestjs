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
    postCode: string;
    @ApiModelProperty({required: true})
    bankNumber: string;
    @ApiModelProperty({required: true})
    email: string;
    @ApiModelProperty({required: true})
    phone: string;
    @ApiModelProperty({required: true})
    phonePrefix: string;

    constructor(city: City,
                type: NgoType,
                longitude: number,
                latitude: number,
                name: string,
                longName: string,
                description: string,
                address: string,
                bankNumber: string,
                email: string,
                phone: string,
                phonePrefix: string,
                postCode: string) {
        this.city = city;
        this.type = type;
        this.longitude = longitude;
        this.latitude = latitude;
        this.name = name;
        this.longName = longName;
        this.description = description;
        this.address = address;
        this.bankNumber = bankNumber;
        this.email = email;
        this.phone = phone;
        this.phonePrefix = phonePrefix;
        this.postCode = postCode
    }
}
