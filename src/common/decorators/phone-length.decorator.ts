import {registerDecorator, ValidationArguments, ValidationOptions} from "class-validator";
import {PhonePrefix} from "../../entity/phone-prefix.entity";

export function PhoneLength(property: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "PhoneLength",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                async validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = (args.object as any)[relatedPropertyName];
                    const prefix = await PhonePrefix.findOne({value: relatedValue});
                    return typeof value === "number" &&
                        typeof relatedValue === "number" &&
                        !!prefix &&
                        value.toString().length <= prefix.maxLength
                }
            }
        });
    };
}
