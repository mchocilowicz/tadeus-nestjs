import {Injectable} from "@nestjs/common";

const nodemailer = require('nodemailer');

@Injectable()
export class EmailService {
    private transporter: any;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.TDS_EMAIL_HOST,
            port: 465,
            pool: true,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.TDS_EMAIL_USER,
                pass: process.env.TDS_EMAIL_PASSWORD
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false
            }
        });
    }

    async sendEmail(to: string, message: string, subject: string) {
        await this.transporter.sendMail({
            from: process.env.TDS_EMAIL_USER,
            to: to,
            subject: subject,
            text: message
        });
    }
}
