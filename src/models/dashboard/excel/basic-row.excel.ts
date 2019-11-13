import {IsAlpha, IsNotEmpty, IsNumber} from "class-validator";
import {PhonePrefixExists} from "../../../common/decorators/phone-prefix-exists.decorator";
import {PhoneLength} from "../../../common/decorators/phone-length.decorator";

export class BasicRowExcel {

    @IsNotEmpty({message: 'excel_data_required'})
    @IsNumber({allowNaN: false}, {message: 'excel_phone_format'})
    @PhonePrefixExists({message: 'excel_phone_prefix_not_exists'})
    phonePrefix: number;

    @IsNumber({allowNaN: false}, {message: 'excel_phone_format'})
    @IsNotEmpty({message: 'excel_data_required'})
    @PhoneLength('phonePrefix', {message: 'excel_phone_format'})
    phone: number;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    name: string;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    type: string;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    latitude: number;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    longitude: number;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    street: string;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    number: number;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    postCode: string;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    @IsAlpha({
        message: "excel_city_format"
    })
    city: string;

    constructor(phone: number, prefix: number, name: string, type: string, city: string, street: string, postCode: string, longitude: number, latitude: number, number: number) {
        this.phone = phone;
        this.phonePrefix = prefix;
        this.name = name;
        this.type = type;
        this.city = city;
        this.street = street;
        this.postCode = postCode;
        this.longitude = longitude;
        this.latitude = latitude;
        this.number = number;
    }
}
