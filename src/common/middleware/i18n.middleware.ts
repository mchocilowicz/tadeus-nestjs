import {messages} from "../../i18n/i18n";

const Polyglot = require('node-polyglot');


export function i18nMiddleware(req: any, res: any, next: any) {
    const language = req.headers['accept-language'];

    req.polyglot = new Polyglot();

    if (language == 'eng') {
        req.polyglot.extend(messages.eng)
    } else {
        req.polyglot.extend(messages.pl)
    }
    next()
}

