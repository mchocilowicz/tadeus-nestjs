import {Module} from "@nestjs/common";
import {TerminalController} from "./terminal.controller";
import {CodeService} from "../../../common/service/code.service";

@Module({
    controllers: [TerminalController],
    providers: [CodeService]
})
export class TerminalModule {
}
