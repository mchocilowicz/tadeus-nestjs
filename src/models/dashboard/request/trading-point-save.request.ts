export class TradingPointSaveRequest {
    ID?: string;
    type: string;
    phone: number;
    name: string;
    donationPercentage: number;
    email: string;
    price: number;
    active: boolean;
    vat: number;
    fee: number;
    xp: number;
    address: TradingPointAddressSaveRequest;

    constructor(ID: string, phone: number, type: string, name: string, donationPercentage: number, email: string, price: number, active: boolean, vat: number, fee: number, xp: number, address: TradingPointAddressSaveRequest) {
        this.ID = ID;
        this.type = type;
        this.phone = phone;
        this.name = name;
        this.donationPercentage = donationPercentage;
        this.email = email;
        this.price = price;
        this.active = active;
        this.vat = vat;
        this.fee = fee;
        this.xp = xp;
        this.address = address;
    }
}

export class TradingPointAddressSaveRequest {
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
