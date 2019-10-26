import { IsAlpha, IsNotEmpty, IsNumberString, NotContains } from "class-validator";
import { PhonePrefixExists } from "../../common/decorators/phone-prefix-exists.decorator";
import { PhoneLength } from "../../common/decorators/phone-length.decorator";

export class BasicRowExcel {

    @IsNotEmpty({message: 'excel_data_required'})
    @PhonePrefixExists({message: 'excel_phone_prefix_not_exists'})
    phonePrefix: string;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    @IsNumberString({message: 'excel_phone_format'})
    @NotContains("-", {message: 'excel_phone_format'})
    @NotContains(" ", {message: 'excel_phone_format'})
    @NotContains("+", {message: 'excel_phone_format'})
    @PhoneLength('phonePrefix', {message: 'excel_phone_format'})
    phone: string;

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
    address: string;

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

    constructor(phone: number, prefix: string, name: string, type: string, city: string, address: string, postCode: string, longitude: number, latitude: number) {
        this.phone = String(phone);
        this.phonePrefix = prefix;
        this.name = name;
        this.type = type;
        this.city = city;
        this.address = address;
        this.postCode = postCode;
        this.longitude = longitude;
        this.latitude = latitude;
    }
}
