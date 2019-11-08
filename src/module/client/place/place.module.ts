import {Module} from "@nestjs/common";
import {PlaceController} from "./place.controller";

@Module({
    imports: [],
    controllers: [PlaceController],
    providers: [],
})
export class PlaceModule {
}
