import {Injectable, InternalServerErrorException, Logger} from "@nestjs/common";
import {RoleEnum} from "../enum/role.enum";

const crypto = require('crypto');

@Injectable()
export class CryptoService {
    private readonly vi: string;
    private readonly pwd: string;
    private readonly alg: any;
    private readonly token: string;
    private readonly crypto_hash: string;
    private readonly salt: string;

    private readonly logger = new Logger(CryptoService.name);


    constructor() {
        const tdsVi = process.env.TDS_VI;
        const tdsPwd = process.env.TDS_PWD;
        const tdsAlg = process.env.TDS_ALG;
        const tdsToken = process.env.TDS_TOKEN;
        const tdsCrypto = process.env.TDS_CRYPTO;
        const tdsSalt = process.env.TDS_SALT;

        if (!tdsVi && !tdsPwd && !tdsAlg && !tdsToken && !tdsCrypto && !tdsSalt) {
            this.logger.error('Env properties not available');
            throw new InternalServerErrorException()
        }

        this.vi = tdsVi ? tdsVi : "";
        this.pwd = tdsPwd ? tdsPwd : "";
        this.alg = tdsAlg ? tdsAlg : "";
        this.token = tdsToken ? tdsToken : "";
        this.crypto_hash = tdsCrypto ? tdsCrypto : "";
        this.salt = tdsSalt ? tdsSalt : "";
    }


    encrypt(text: string): string {
        const vi = new Buffer(this.vi);
        let cipher = crypto.createCipheriv(this.alg, Buffer.from(this.pwd), vi, {
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
        let decipher = crypto.createDecipheriv(this.alg, Buffer.from(this.pwd), iv, {
            authTagLength: 16
        });

        let decrypted = decipher.update(encryptedText);

        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

    md5Tokne(text: string): string {
        return crypto.createHash(this.token).update(text).digest("hex");
    }

    sweet(text: string): string {
        return crypto.pbkdf2Sync(text, this.salt,
            1000, 64, this.crypto_hash).toString(`hex`);
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
