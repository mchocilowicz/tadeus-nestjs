import { Module } from "@nestjs/common";
import { PartnerController } from "./partner.controller";
import { LoginService } from "../common/login.service";
import { CodeService } from "../../common/service/code.service";
import { CryptoService } from "../../common/service/crypto.service";
import { TadeusJwtModule } from "../common/TadeusJwtModule/tadeusJwt.module";
import { RouterModule, Routes } from "nest-router";
import { TransactionModule } from "./transaction/transaction.module";
import { TerminalModule } from "./terminal/terminal.module";

const routes: Routes = [
    {
        path: '/transaction',
        module: TransactionModule
    },
    {
        path: '/terminal',
        module: TerminalModule
    }
];

@Module({
    controllers: [
        PartnerController
    ],
    providers: [
        LoginService, CodeService, CryptoService
    ],
    imports: [
        TadeusJwtModule,
        RouterModule.forRoutes(routes),
        TransactionModule,
        TerminalModule
    ]
})
export class PartnerModule {
}
