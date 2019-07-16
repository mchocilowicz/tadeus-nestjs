import { Module } from "@nestjs/common";
import { ClientController } from "./client.controller";
import { LoginModule } from "../login/login.module";

@Module({
    imports: [LoginModule],
    controllers: [ClientController],
    providers: [],
})
export class ClientModule {
}
