import { Body, Controller, Delete, Get, Post, Query } from "@nestjs/common";
import { PlaceType } from "../../entity/place-type.entity";

@Controller()
export class PlaceController {

    @Post()
    create() {
    }

    @Get()
    getAll(@Query() query) {
        console.log(query)
    }

    @Delete()
    delete() {
    }

    @Get('type')
    getPlaceTypes() {
    }

    @Post('type')
    savePlaceType(@Body() dto: { name: string }) {
        const type = new PlaceType();
        type.name = dto.name;
        type.save();
    }

}
