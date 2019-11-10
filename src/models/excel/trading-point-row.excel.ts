import {IsNotEmpty} from "class-validator";
import {BasicRowExcel} from "./basic-row.excel";

export class TradingPointExcelRow extends BasicRowExcel {
    @IsNotEmpty({
        message: "excel_data_required"
    })
    name: string;


    constructor(row: any) {
        super(row.phone, row.phonePrefix, row.name, row.type, row.city, row.street, row.postCode, row.longitude, row.latitude, row.number);
        this.name = row.name;
    }
}
