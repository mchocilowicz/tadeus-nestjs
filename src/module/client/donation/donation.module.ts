import {Module} from "@nestjs/common";
import {DonationController} from "./donation.controller";
import {CodeService} from "../../../common/service/code.service";

@Module({
    controllers: [
        DonationController
    ],
    providers: [CodeService],
})
export class DonationModule {
}
