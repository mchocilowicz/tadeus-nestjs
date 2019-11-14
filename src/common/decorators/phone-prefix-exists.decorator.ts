import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";
import { PhonePrefix } from "../../database/entity/phone-prefix.entity";

@ValidatorConstraint({async: true})
export class PhonePrefixExistsConstraint implements ValidatorConstraintInterface {
    async validate(phonePrefix: number, args: ValidationArguments) {
        const prefix = await PhonePrefix.findOne({value: phonePrefix});
        return !!prefix;
    }
}

export function PhonePrefixExists(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: PhonePrefixExistsConstraint
        });
    };
}
