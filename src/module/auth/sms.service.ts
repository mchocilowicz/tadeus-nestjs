import {Injectable} from "@nestjs/common";

const twilio = require("twilio");

@Injectable()
export class SmsService {
    sendMessage(code: number, phone: string): void {
        const accountSid = '';
        const authToken = '';
        twilio(accountSid, authToken).messages.create({
            body: code,
            from: '+48732230089',
            to: '+48' + phone
        }).then(message => console.log(message));
    }
}
