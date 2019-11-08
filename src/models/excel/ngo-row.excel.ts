import {IsAlpha, IsEmail, IsNotEmpty, IsNumberString} from "class-validator";
import {BasicRowExcel} from "./basic-row.excel";

export class NgoRowExcel extends BasicRowExcel {

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

    constructor(row: any) {
        super(row.phone, row.phonePrefix, row.name, row.type, row.city, row.street, row.postCode, row.longitude, row.latitude, row.number);
        this.longName = row.longName;
        this.description = row.description;
        this.accountNumber = row.accountNumber;
        this.email = row.email;
    }
}

