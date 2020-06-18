import { IPlaceQuery } from "./place-query.interface";
import { ILocationQuery } from "./location-query.interface";

export class PlaceQuery implements ILocationQuery {
    [key: string]: any

    city?: string;
    placeType?: string;
    longitude?: number;
    latitude?: number;


    constructor(query: IPlaceQuery) {
        this.city = query.city;
        this.placeType = query.placeType;
        this.longitude = query.longitude;
        this.latitude = query.latitude;
    }
}
