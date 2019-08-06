const uuidv4 = require('uuid/v4');

export class CodeService {
    generateVirtualCardNumber(): string {
        const result = ['VRC', this.generateSmsCode()];
        let uuid: string = uuidv4();
        let list: string[] = uuid.split('-');
        result.push(list[0], list[list.length - 1]);
        return result.join('-');
    }

    generateSmsCode(): number {
        const min = Math.ceil(1000);
        const max = Math.floor(9999);
        // return Math.floor(Math.random() * (max - min + 1)) + min;
        return 1234;
    }
}
