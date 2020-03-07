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

    async sendEmail(emailObject: any) {
        await this.transporter.sendMail({
            from: process.env.TDS_EMAIL_USER,
            to: emailObject.email,
            subject: "Tadeus – podsumowanie współpracy i wpłata",
            text: `
                Dzień dobry!
                Twoi klienci w ramach Narodowego Systemu Donacji gromadzili donacje na cele charytatywne i
                społeczne. Aktualne rozliczenie dotyczy okresu od ${emailObject.from} r. do ${emailObject.to} r. W tym 
                okresie Twoi klienci korzystając z Systemu Tadeus dokonali u Ciebie zakupów na łączną kwotę ${emailObject.sellPrice} PLN!
                Gratulujemy!
                
                Łączna donacja, jaką uzyskali Twoi klienci to kwota ${emailObject.donationPrice} PLN. 
                
                Teraz pora na Ciebie!Dokonaj wpłaty na nasze konto, a my po otrzymaniu od Ciebie wpłaty 
                przekażemy jąna cele społeczne i charytatywne wybrane przez Twoich klientów.
                
                Twoje zadłużenie wynosi na dziś: ${emailObject.price}PLN
                 
                Wpłaty należy dokonać w terminie 7 dni tj. do ${emailObject.limit} r. 
                
                Wpłaty możesz dokonać na nasze konto: 12 2323 2323 2323 2323 23232323 lub logując się do 
                aplikacji Tadeus4Partner i wybierając opcję wpłaty. W aplikacji dostępne są dla Twojej wygody 
                także płatności z wykorzystaniem kart płatniczych oraz BLIK. 
                
                Pozdrawiamy,
                Zespół Narodowego Systemu Donacji Tadeus
            `
        });
    }
}
