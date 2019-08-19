import { Module } from "@nestjs/common";
import { ClientController } from "./client.controller";
import { CodeService } from "../../common/service/code.service";

@Module({
    imports: [],
    controllers: [ClientController],
    providers: [CodeService],
})
export class ClientModule {
}
