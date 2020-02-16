export class AddressSaveRequest {
    street: string;
    number: number;
    postCode: string;
    longitude: number;
    latitude: number;
    city: string;

    constructor(street: string, number: number, postCode: string, longitude: number, latitude: number, city: string) {
        this.street = street;
        this.number = number;
        this.postCode = postCode;
        this.longitude = longitude;
        this.latitude = latitude;
        this.city = city;
    }
}
