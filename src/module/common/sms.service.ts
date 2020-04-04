import {Injectable} from "@nestjs/common";
import {Twilio} from "twilio";
import {MessageInstance} from "twilio/lib/rest/api/v2010/account/message";

const twilio = require("twilio");

@Injectable()
export class SmsService {
    private twilioClient?: Twilio;

    constructor() {
        // const accountSid: any = process.env.TDS_TWILIO_ACCOUNT;
        // const authToken: any = process.env.TDS_TWILIO_AUTH_TOKEN;
        // this.twilioClient = twilio(accountSid, authToken)
    }

    sendMessage(code: any, phone: any): void {
        this.twilioClient?.messages.create({
            body: code,
            from: process.env.TDS_TWILIO_PHONE,
            to: '+48' + phone
        }).then((message: MessageInstance) => console.log(message.dateSent));
    }
}
