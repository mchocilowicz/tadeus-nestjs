import {ValueTransformer} from "typeorm";

export class ColumnNumericTransformer implements ValueTransformer {
    to(data?: number | null): number | null {
        if (data) {
            return Number(data)
        }
        return null;
    }

    from(data?: string | null): number | null {
        if (data) {
            return Number(data);
        }
        return null
    }
}