import {
    IsAlpha,
    IsBoolean,
    IsDate,
    IsEmail,
    IsNotEmpty,
    IsNumberString,
    IsPhoneNumber,
    NotContains
} from "class-validator";

export class NgoRowExcel {
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
    @IsPhoneNumber('PL', {message: 'excel_phone_format'})
    @NotContains("-", {message: 'excel_phone_format'})
    @NotContains(" ", {message: 'excel_phone_format'})
    phone: string;

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
    @IsBoolean({
        message: "excel_verified_format"
    })
    verified: boolean;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    latitude: number;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    longitude: number;

    @IsDate({
        message: 'excel_verification_date_format'
    })
    verificationDate: Date;

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
        this.name = row.name ? row.name : null;
        this.type = row.type ? row.type : null;
        this.accountNumber = row.accountNumber ? row.accountNumber : null;
        this.email = row.email ? row.email : null;
        this.phone = row.phone ? row.phone : null;
        this.verified = row.verified ? row.verified : null;
        this.verificationDate = row.verificationDate ? row.verificationDate : null;
        this.longitude = row.longitude ? Number(row.longitude) : null;
        this.latitude = row.latitude ? Number(row.latitude) : null;
        this.city = row.city ? row.city : null;
        this.address = row.address ? row.address : null;
        this.postCode = row.postCode ? row.postCode : null;

    }
}

