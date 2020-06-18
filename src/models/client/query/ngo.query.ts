import { INgoQuery } from "./ngo-query.interface";
import { ILocationQuery } from "./location-query.interface";

export class NgoQuery implements ILocationQuery {
    [key: string]: any

    city?: string;
    ngoType?: string;
    longitude?: number;
    latitude?: number;

    constructor(query: INgoQuery) {
        this.city = query.city
        this.ngoType = query.ngoType
        this.latitude = query.latitude
        this.longitude = query.longitude
    }
}
