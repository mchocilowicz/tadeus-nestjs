import { Module } from "@nestjs/common";
import { ClientController } from "./client.controller";
import { CodeService } from "../../common/service/code.service";
import { LoginService } from "../common/login.service";
import { CryptoService } from "../../common/service/crypto.service";
import { TadeusJwtModule } from "../common/TadeusJwtModule/tadeusJwt.module";
import { RouterModule, Routes } from "nest-router";
import { NgoModule } from "./ngo/ngo.module";
import { RegisterModule } from "./register/register.module";
import { CityModule } from "./city/city.module";
import { PlaceModule } from "./place/place.module";

const routes: Routes = [
    {
        path: '/ngo',
        module: NgoModule
    },
    {
        path: '/register',
        module: RegisterModule
    },
    {
        path: '/city',
        module: CityModule
    },
    {
        path: '/place',
        module: PlaceModule
    }
];

@Module({
    imports: [
        TadeusJwtModule,
        RouterModule.forRoutes(routes),
        NgoModule,
        RegisterModule,
        CityModule,
        PlaceModule
    ],
    controllers: [ClientController],
    providers: [CodeService, LoginService, CryptoService],
})
export class ClientModule {
}
