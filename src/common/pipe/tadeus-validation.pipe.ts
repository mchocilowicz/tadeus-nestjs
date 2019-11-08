import {ArgumentMetadata, Injectable, PipeTransform} from "@nestjs/common";
import {validate} from "class-validator";
import {plainToClass} from "class-transformer";
import {TadeusValidationException} from "../exceptions/TadeusValidation.exception";
import {extractErrors} from "../util/functions";

@Injectable()
export class TadeusValidationPipe implements PipeTransform<any> {
    async transform(value: any, {metatype}: ArgumentMetadata) {
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }
        const object = plainToClass(metatype, value);
        const errors = await validate(object);
        console.log(errors);
        if (errors.length > 0) {
            throw new TadeusValidationException(extractErrors(errors))
        }
        return value;
    }

    private toValidate(metatype: Function): boolean {
        const types: Function[] = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }
}
