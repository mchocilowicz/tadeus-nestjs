import { HttpException, HttpStatus } from "@nestjs/common";

export class TadeusValidationException extends HttpException {
    constructor(validationCodes: any) {
        super(validationCodes, HttpStatus.CONFLICT)
    }
}
