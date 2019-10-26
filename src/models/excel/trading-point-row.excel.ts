import { IsNotEmpty, IsNumber } from "class-validator";
import { BasicRowExcel } from "./basic-row.excel";

export class TradingPointExcelRow extends BasicRowExcel {
    @IsNotEmpty({
        message: "excel_data_required"
    })
    name: string;

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
    @IsNumber({}, {
        message: "excel_xp_format"
    })
    xp: number;

    constructor(row: any) {
        super(row.phone, row.phonePrefix, row.name, row.type, row.city, row.address, row.postCode, row.longitude, row.latitude);
        this.name = row.name;
        this.donationPercentage = row.donationPercentage;
        this.manipulationFee = row.manipulationFee;
        this.xp = row.xp;
    }
}
