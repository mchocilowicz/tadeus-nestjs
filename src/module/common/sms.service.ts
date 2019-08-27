import { Injectable } from "@nestjs/common";

const twilio = require("twilio");

@Injectable()
export class SmsService {
    private twilioClient: any;

    constructor() {
        const accountSid = process.env.TWILIO_ACCOUNT_SKID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        // this.twilioClient = twilio(accountSid, authToken)
    }

    sendMessage(code: number, phone: string): void {
        this.twilioClient.messages.create({
            body: code,
            from: '+48732230089',
            to: '+48' + phone
        }).then(message => console.log(message));
    }
}
