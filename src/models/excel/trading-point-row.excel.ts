import { IsAlpha, IsNotEmpty, IsNumber } from "class-validator";
import { PhoneRequest } from "../request/phone.request";

export class TradingPointExcelRow extends PhoneRequest {
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
    @IsNumber({}, {
        message: "excel_donation_format"
    })
    donationPercentage: number;

    @IsNumber({}, {
        message: "excel_manipulation_fee_format"
    })
    manipulationFee: number;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    longitude: number;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    latitude: number;

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
    @IsNumber({}, {
        message: "excel_xp_format"
    })
    xp: number;

    @IsNotEmpty({
        message: "excel_data_required"
    })
    @IsAlpha({
        message: "excel_city_format"
    })
    city: string;

    constructor(row: any) {
        super();
        this.name = row.name ? row.name : null;
        this.type = row.type ? row.type : null;
        this.donationPercentage = row.donationPercentage ? row.donationPercentage : null;
        this.manipulationFee = row.manipulationFee ? row.manipulationFee : 0.66;
        this.latitude = row.latitude ? Number(row.latitude) : null;
        this.longitude = row.longitude ? Number(row.longitude) : null;
        this.address = row.address ? row.address : null;
        this.postCode = row.postCode ? row.postCode : null;
        this.xp = row.xp ? row.xp : null;
        this.city = row.city ? row.city : null;
        this.phone = row.phone ? String(row.phone) : null;
        this.phonePrefix = row.phonePrefix ? row.phonePrefix : null;
    }
}
