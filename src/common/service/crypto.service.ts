import { Injectable } from "@nestjs/common";

const crypto = require('crypto');

@Injectable()
export class CryptoService {

    encrypt(text: string): string {
        const vi = new Buffer(process.env.TADEUS_VI);
        let cipher = crypto.createCipheriv(process.env.TADEUS_ALG, Buffer.from(process.env.TADEUS_PWD), vi, {
            authTagLength: 16
        });
        let encrypted = cipher.update(text);

        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return vi.toString('hex') + ':' + encrypted.toString('hex');
    }

    decrypt(text: string): string {

        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv(process.env.TADEUS_ALG, Buffer.from(process.env.TADEUS_PWD), iv, {
            authTagLength: 16
        });
        let decrypted = decipher.update(encryptedText);

        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

    //md5
    md5Tokne(text: string): string {
        return crypto.createHash(process.env.TADEUS_TOKEN).update(text).digest("hex");
    }

    // sha512
    sweet(text: string): string {
        return crypto.pbkdf2Sync(text, process.env.TADEUS_SALT,
            1000, 64, process.env.TADEUS_CRYPTO).toString(`hex`);
    }

    generateToken(id: string): string {
        let c = id.split('-').reverse().join();
        let hash = this.encrypt(c);
        let md5a = hash.split('').reverse().join();
        let md5b = md5a.split('').sort().join();
        let parts = id.split('-');
        let a = parts[1];
        parts[1] = parts[2];
        parts[2] = a;
        let newId = parts.join('-');
        let s = newId.replace(md5b[0], md5a[0]);
        let md5Token = this.md5Tokne(s);

        return this.sweet(md5Token);
    }

    encryptId(id: string): string {
        let idParts = id.split('-');
        let p = idParts[1];
        idParts[1] = idParts[2];
        idParts[2] = idParts[3];
        idParts[3] = p.split('').reverse().join('');
        return this.encrypt(idParts.join('-'));
    }

    decryptId(hash: string): string {
        let id = this.decrypt(hash);
        let idParts = id.split('-');
        let p = idParts[3];
        idParts[3] = idParts[2];
        idParts[2] = idParts[1];
        idParts[1] = p.split('').reverse().join('');
        return idParts.join('-');
    }
}
