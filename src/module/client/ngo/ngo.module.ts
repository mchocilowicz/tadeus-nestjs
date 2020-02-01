import {Module} from "@nestjs/common";
import {NgoController} from "./ngo.controller";
import {CodeService} from "../../../common/service/code.service";

@Module({
    imports: [],
    controllers: [NgoController],
    providers: [CodeService],
})
export class NgoModule {
}
