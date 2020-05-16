import {AddressSaveRequest} from "./address-save.request";

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
    description: string;
    address: AddressSaveRequest;

    constructor(ID: string, phone: number, type: string, name: string, donationPercentage: number, email: string, price: number, active: boolean, vat: number, fee: number, xp: number, description: string, address: AddressSaveRequest) {
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
        this.description = description;
    }
}
