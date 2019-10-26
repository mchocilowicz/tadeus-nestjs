import { BadRequestException, Logger } from "@nestjs/common";
import { QueryFailedError } from "typeorm";
import { ValidationError } from "class-validator";

const _ = require("lodash");

export function handleException(e: any, prefix: string, logger: Logger) {
    logger.error(e);
    if (e instanceof QueryFailedError) {
        parseQueryFailedError(e, prefix)
    } else {
        throw e;
    }
}

function parseQueryFailedError(e: any, prefix: string) {
    if (e.code === '23505') {
        throw new BadRequestException(prefix + '_unique_name')
    } else {
        throw new BadRequestException(prefix + '_not_created');
    }
}

export function extractErrors(errors: ValidationError[]): string[] {
    let constraints = _.map(errors, 'constraints');
    let errorCodes: string[] = [];
    constraints.forEach((c: any) => {
        errorCodes.push(_.values(c))
    });
    return _.uniq(_.flatten(errorCodes))[0]
}
