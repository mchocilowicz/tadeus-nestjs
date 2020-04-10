import {Injectable} from "@nestjs/common";
import {Twilio} from "twilio";

const twilio = require("twilio");

@Injectable()
export class SmsService {
    private twilioClient: Twilio;

    constructor() {
        const accountSid: any = process.env.TDS_TWILIO_ACCOUNT;
        const authToken: any = process.env.TDS_TWILIO_AUTH_TOKEN;
        this.twilioClient = twilio(accountSid, authToken)
    }

    async sendMessage(code: any, phone: any) {
        try {
            await this.twilioClient.messages.create({
                body: code,
                from: `${process.env.TDS_TWILIO_PHONE}`,
                to: '+48' + phone
            });
            console.log('Sms code send');
        } catch (e) {
            console.log(e);
        }


    }
}
