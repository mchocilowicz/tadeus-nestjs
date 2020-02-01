import {Module} from "@nestjs/common";
import {PartnerTerminalController} from "./partner-terminal.controller";
import {CodeService} from "../../../common/service/code.service";

@Module({
    controllers: [PartnerTerminalController],
    providers: [CodeService]
})
export class PartnerTerminalModule {
}
