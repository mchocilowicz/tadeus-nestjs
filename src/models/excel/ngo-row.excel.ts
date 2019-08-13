import { IsAlpha, IsBoolean, IsDate, IsEmail, IsNotEmpty, IsNumberString, IsPhoneNumber } from "class-validator";

export class NgoRowExcel {
    @IsNotEmpty({
        message: "excel_name_required"
    })
    @IsAlpha({
        message: "excel_name_format"
    })
    name: string;

    @IsNotEmpty({
        message: "excel_type_required"
    })
    @IsAlpha({
        message: "excel_type_format"
    })
    type: string;

    @IsNotEmpty({
        message: "excel_account_number_required"
    })
    @IsNumberString({
        message: 'excel_account_number_format'
    })
    accountNumber: number;

    @IsNotEmpty({
        message: "excel_phone_required"
    })
    @IsPhoneNumber('PL', {message: 'excel_phone_format'})
    phone: string;

    @IsNotEmpty({
        message: "excel_email_required"
    })
    @IsEmail({}, {
        message: "excel_email_ format"
    })
    email: string;

    @IsNotEmpty({
        message: "excel_verified_required"
    })
    @IsBoolean({
        message: "excel_verified_format"
    })
    verified: boolean;

    @IsNotEmpty({
        message: "excel_location_required"
    })
    location: string;

    @IsDate({
        message: 'excel_verification_date_format'
    })
    verificationDate: Date;

    @IsNotEmpty({
        message: "excel_city_required"
    })
    @IsAlpha({
        message: "excel_city_format"
    })
    city: string;

    constructor(row: any) {
        this.name = row.name ? row.name : null;
        this.type = row.type ? row.type : null;
        this.accountNumber = row.accountNumber ? row.accountNumber : null;
        this.email = row.email ? row.email : null;
        this.phone = row.phone ? row.phone : null;
        this.verified = row.verified ? row.verified : null;
        this.verificationDate = row.verificationDate ? row.verificationDate : null;
        this.location = row.location ? row.location : null;
        this.city = row.city ? row.city : null;
    }
}

