import { IsAlpha, IsEmail, IsNotEmpty, IsNumberString } from "class-validator";
import { PhoneRequest } from "../request/phone.request";

export class NgoRowExcel extends PhoneRequest {
    @IsNotEmpty({
        message: "excel_data_required"
    })
    @IsAlpha({
        message: "excel_name_format"
    })
    name: string;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    @IsAlpha({
        message: "excel_name_format"
    })
    longName: string;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    @IsAlpha({
        message: "excel_name_format"
    })
    description: string;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    @IsAlpha({
        message: "excel_type_format"
    })
    type: string;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    @IsNumberString({
        message: 'excel_account_number_format'
    })
    accountNumber: string;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    @IsEmail({}, {
        message: "excel_email_format"
    })
    email: string;

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
    @IsAlpha({
        message: "excel_city_format"
    })
    city: string;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    address: string;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    postCode: string;

    constructor(row: any) {
        super();
        this.name = row.name ? row.name : null;
        this.longName = row.longName ? row.longName : null;
        this.description = row.description ? row.description : null;
        this.type = row.type ? row.type : null;
        this.accountNumber = row.accountNumber ? row.accountNumber : null;
        this.email = row.email ? row.email : null;
        this.phone = row.phone ? row.phone : null;
        this.phonePrefix = row.phonePrefix ? row.phonePrefix : null;
        this.longitude = row.longitude ? Number(row.longitude) : null;
        this.latitude = row.latitude ? Number(row.latitude) : null;
        this.city = row.city ? row.city : null;
        this.address = row.address ? row.address : null;
        this.postCode = row.postCode ? row.postCode : null;

    }
}

