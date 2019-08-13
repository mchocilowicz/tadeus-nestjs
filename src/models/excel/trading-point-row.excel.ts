import { IsAlpha, IsNotEmpty, IsNumber } from "class-validator";

export default class TradingPointExcelRow {
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
        message: "excel_donation_required"
    })
    @IsNumber({}, {
        message: "excel_donation_format"
    })
    donationPercentage: number;

    @IsNotEmpty({
        message: "excel_vat_required"
    })
    @IsNumber({}, {
        message: "excel_vat_format"
    })
    vat: number;

    @IsNumber({}, {
        message: "excel_manipulation_fee_format"
    })
    manipulationFee: number;

    @IsNotEmpty({
        message: "excel_location_required"
    })
    location: string;

    @IsNotEmpty({
        message: "excel_address_required"
    })
    address: string;

    @IsNotEmpty({
        message: "excel_post_code_required"
    })
    postCode: string;

    @IsNotEmpty({
        message: "excel_xp_required"
    })
    @IsNumber({}, {
        message: "excel_xp_format"
    })
    xp: number;

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
        this.donationPercentage = row.donationPercentage ? row.donationPercentage : null;
        this.vat = row.vat ? row.vat : null;
        this.manipulationFee = row.manipulationFee ? row.manipulationFee : 0.66;
        this.location = row.location ? row.location : null;
        this.address = row.address ? row.address : null;
        this.postCode = row.postCode ? row.postCode : null;
        this.xp = row.xp ? row.xp : null;
        this.city = row.city ? row.city : null;
    }
}
