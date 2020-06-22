import {Step} from "../../../common/enum/status.enum";
import {Terminal} from "../../../entity/terminal.entity";

export class TerminalCreateResponse {
    ID: string;
    name?: string;
    phone?: number;
    step: Step;

    constructor(terminal: Terminal) {
        this.ID = terminal.ID;
        this.name = terminal.name;
        this.phone = terminal.phone?.value;
        this.step = terminal.step;
    }
}