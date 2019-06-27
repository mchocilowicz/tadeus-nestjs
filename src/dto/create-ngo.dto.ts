import { City } from "../entity/city.entity";
import { NgoType } from "../entity/ngo-type.entity";

export class CreateNgoDto {
    city: City;
    type: NgoType;
    location: string;
    name: string;
    address: string;
}
