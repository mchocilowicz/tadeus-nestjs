import {ValueTransformer} from "typeorm";
import { roundToTwo } from "./functions";

export class ColumnNumericTransformer implements ValueTransformer {
    to(data?: number | null): number | null {
        if (data) {
            return roundToTwo(Number(data));
        }
        return 0;
    }

    from(data?: string | null): number | null {
        if (data) {
            return roundToTwo(Number(data));
        }
        return 0
    }
}
