import { BadRequestException, Logger } from "@nestjs/common";
import { QueryFailedError } from "typeorm";
import { ValidationError } from "class-validator";
import { TadeusEntity } from "../../entity/base.entity";

const _ = require("lodash");
const moment = require("moment");

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

export function groupDatesByComponent(data: TadeusEntity[], token: string): Array<TadeusEntity[]> {
    const groupedMap = data.reduce(function (val: Map<string, TadeusEntity[]>, obj: TadeusEntity) {
        let comp = moment(obj.createdAt).format(token);
        const value = val.get(comp);
        if (value) {
            value.push(obj);
        } else {
            val.set(comp, [obj])
        }
        return val;
    }, new Map<string, []>());
    const result: Array<TadeusEntity[]> = [];
    groupedMap.forEach(value => result.push(value));
    return result;
}

export function roundToTwo(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100
}
