import {Module} from "@nestjs/common";
import {NgoTypeController} from "./ngo-type.controller";

@Module({
    controllers: [NgoTypeController],
    imports: [],
    providers: []
})
export class NgoTypeModule {
}
