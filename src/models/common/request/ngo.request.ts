import { ApiProperty } from "@nestjs/swagger";
import { City } from "../../../entity/city.entity";
import { NgoType } from "../../../entity/ngo-type.entity";

export class NgoRequest {
    @ApiProperty({required: true})
    city: City;
    @ApiProperty({required: true})
    type: NgoType;
    @ApiProperty({required: true})
    latitude: number;
    @ApiProperty({required: true})
    longitude: number;
    @ApiProperty({required: true})
    name: string;
    @ApiProperty({required: true})
    longName: string;
    @ApiProperty({required: true})
    description: string;
    @ApiProperty({required: true})
    street: string;
    @ApiProperty({required: true})
    number: number;
    @ApiProperty({required: true})
    postCode: string;
    @ApiProperty({required: true})
    bankNumber: string;
    @ApiProperty({required: true})
    email: string;
    @ApiProperty({required: true})
    phone: number;
    @ApiProperty({required: true})
    phonePrefix: number;

    constructor(city: City,
                type: NgoType,
                longitude: number,
                latitude: number,
                name: string,
                longName: string,
                description: string,
                street: string,
                number: number,
                bankNumber: string,
                email: string,
                phone: number,
                phonePrefix: number,
                postCode: string) {
        this.city = city;
        this.type = type;
        this.longitude = longitude;
        this.latitude = latitude;
        this.name = name;
        this.longName = longName;
        this.description = description;
        this.street = street;
        this.number = number;
        this.bankNumber = bankNumber;
        this.email = email;
        this.phone = phone;
        this.phonePrefix = phonePrefix;
        this.postCode = postCode
    }
}
