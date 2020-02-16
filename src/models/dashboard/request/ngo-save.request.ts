import {AddressSaveRequest} from "./address-save.request";

export class NgoSaveRequest {
    name: string;
    longName: string;
    email: string;
    bankNumber: number;
    description: string;
    verified: boolean;
    verifiedAt: Date;
    createdAt: Date;
    type: string;
    collectedDonation: number;
    phone: number;
    address: AddressSaveRequest;


    constructor(name: string, longName: string, email: string, bankNumber: number, description: string, verified: boolean, verifiedAt: Date, createdAt: Date, type: string, collectedDonation: number, phone: number, address: AddressSaveRequest) {
        this.name = name;
        this.longName = longName;
        this.email = email;
        this.bankNumber = bankNumber;
        this.description = description;
        this.verified = verified;
        this.verifiedAt = verifiedAt;
        this.createdAt = createdAt;
        this.type = type;
        this.collectedDonation = collectedDonation;
        this.phone = phone;
        this.address = address;
    }
}
