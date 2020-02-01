import {Const} from "../util/const";
import {Injectable} from "@nestjs/common";

const uuidv4 = require('uuid/v4');
const moment = require('moment');
const crypto = require('crypto');

@Injectable()
export class CodeService {
    generateTradingPointNumber(typeCode: number): string {
        const result = [`B${typeCode}`, Const.CONTROL_NUMBER, this.generateNumber()];
        return result.join('-');
    }

    generateTransactionID(): string {
        const result = ['T000', Const.CONTROL_NUMBER, moment().format('YYYYMMDDhhmmss'), this.generateNumber(), '00'];
        return result.join('-');
    }

    generateDonationID(): string {
        const result = ['D000', Const.CONTROL_NUMBER, moment().format('YYYYMMDDhhmmss'), this.generateNumber()];
        return result.join('-');
    }

    generatePartnerPaymentID(): string {
        const result = ['PP000', Const.CONTROL_NUMBER, moment().format('YYYYMMDDhhmmss'), this.generateNumber()];
        return result.join('-');
    }

    generateUserNumber(): string {
        const result = [`U000`, Const.CONTROL_NUMBER, this.generateNumber()];
        return result.join('-');
    }

    generateVirtualCardNumber(): string {
        const result = ['V001', Const.CONTROL_NUMBER, '0000000000', this.hashId(moment().toISOString() + this.createCode(1, 9999), 13), '00'];
        return result.join('-');
    }

    generatePhysicalCardNumber(ngoCode: string): string {
        const result = ['F001', Const.CONTROL_NUMBER, ngoCode, this.hashId(moment().toISOString() + this.createCode(1, 9999), 13), '00'];
        return result.join('-');
    }

    generateNgoNumber(ngoTypeCode: number, ngoCode: string): string {
        const result = [`B${ngoTypeCode}`, Const.CONTROL_NUMBER, ngoCode];
        return result.join('-');
    }

    generateNumber(): string {
        return this.hashId(moment().toISOString() + this.createCode(1, 9999), 10)
    }

    generateSmsCode(): number {
        const min = Math.ceil(1000);
        const max = Math.floor(9999);
        // return Math.floor(Math.random() * (max - min + 1)) + min;
        return 1234;
    }

    generateTerminalNumber(count: number): string {
        if (count < 10) {
            return '0' + count
        }
        return '' + count;
    }

    createCode(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    private hashId(d: string, size: number) {
        const salt = crypto.randomBytes(16).toString('hex');

        const hash = crypto.pbkdf2Sync(d, salt,
            1000, 64, `sha512`).toString(`hex`);
        return hash.substr(0, size)
    }
}
