import {Module} from "@nestjs/common";
import {PartnerTerminalController} from "./partner-terminal.controller";
import {CodeService} from "../../../common/service/code.service";
import {TerminalService} from "../../common/terminal.service";

@Module({
    controllers: [PartnerTerminalController],
    providers: [CodeService, TerminalService]
})
export class PartnerTerminalModule {
}
