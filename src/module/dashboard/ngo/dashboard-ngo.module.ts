import {Module} from "@nestjs/common";
import {DashboardNgoController} from "./dashboard-ngo.controller";
import {CodeService} from "../../../common/service/code.service";

const moment = require("moment");

@Module({
    controllers: [DashboardNgoController],
    imports: [],
    providers: [CodeService]
})
export class DashboardNgoModule {
}
