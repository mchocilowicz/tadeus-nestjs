import {HttpException, HttpStatus} from "@nestjs/common";

export class ExcelException extends HttpException {
    constructor(rowErrors: any) {
        super(rowErrors, HttpStatus.CONFLICT)
    }
}
