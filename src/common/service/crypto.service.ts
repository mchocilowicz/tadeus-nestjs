import { BadRequestException, Injectable } from "@nestjs/common";
import { RoleEnum } from "../enum/role.enum";

const crypto = require('crypto');

@Injectable()
export class CryptoService {
    private vi: string;
    private pwd: string;


    constructor() {
        if (!process.env.TADEUS_VI) throw new BadRequestException();
        if (!process.env.TADEUS_PWD) throw new BadRequestException();
        this.vi = process.env.TADEUS_VI;
        this.pwd = process.env.TADEUS_PWD;
    }


    encrypt(text: string): string {
        const vi = new Buffer(this.vi);
        let cipher = crypto.createCipheriv(process.env.TADEUS_ALG, Buffer.from(this.pwd), vi, {
            authTagLength: 16
        });
        let encrypted = cipher.update(text);

        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return vi.toString('hex') + ':' + encrypted.toString('hex');
    }

    decrypt(text: string): string {
        if (!text) return text;

        let textParts: string[] = text.split(':');
        let part = textParts.shift();
        if (!part) return text;

        let iv = Buffer.from(part, 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv(process.env.TADEUS_ALG, Buffer.from(this.pwd), iv, {
            authTagLength: 16
        });

        let decrypted = decipher.update(encryptedText);

        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

    md5Tokne(text: string): string {
        return crypto.createHash(process.env.TADEUS_TOKEN).update(text).digest("hex");
    }

    sweet(text: string): string {
        return crypto.pbkdf2Sync(text, process.env.TADEUS_SALT,
            1000, 64, process.env.TADEUS_CRYPTO).toString(`hex`);
    }

    generateToken(id: string, code: number): string {
        let c = id.split('-').reverse().join();

        let hash = this.encrypt(c);

        let md5a = hash.split('').reverse().join();
        let md5b = md5a.split('').sort().join();
        let parts = id.split('-');

        let a = parts[1];
        parts[1] = parts[2];
        parts[2] = a;
        let newId = parts.join('-');
        let s = newId.replace(md5b[0], md5a[0]) + '-' + code;
        let md5Token = this.md5Tokne(s);

        return this.sweet(md5Token);
    }

    encryptId(id: string, role: RoleEnum): string {
        let idParts = id.split('-');
        let p = idParts[1];

        idParts[1] = idParts[2];
        idParts[2] = idParts[3];
        idParts[3] = p.split('').reverse().join('');

        return this.encrypt([idParts.join('-'), role].join(':'));
    }

    decryptId(hash: string): any {
        let id = this.decrypt(hash);
        let obj = id.split(':');
        let idParts = obj[0].split('-');
        let p = idParts[3];

        idParts[3] = idParts[2];
        idParts[2] = idParts[1];
        idParts[1] = p.split('').reverse().join('');

        return {id: idParts.join('-'), role: obj[1]}
    }
}
