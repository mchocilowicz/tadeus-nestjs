import {Module} from "@nestjs/common";
import {ClientController} from "./client.controller";
import {CodeService} from "../../common/service/code.service";
import {LoginService} from "../common/login.service";
import {CryptoService} from "../../common/service/crypto.service";
import {TadeusJwtModule} from "../common/TadeusJwtModule/tadeusJwt.module";
import {CalculationService} from "../../common/service/calculation.service";


@Module({
    imports: [
        TadeusJwtModule,
    ],
    controllers: [ClientController],
    providers: [CodeService, LoginService, CryptoService, CalculationService],
})
export class ClientModule {
}
