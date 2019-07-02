import { Body, Controller, Get, Post } from "@nestjs/common";
import { City } from "../../entity/city.entity";
import { ApiUseTags } from "@nestjs/swagger";

@Controller()
export class CityController {
    @Post()
    @ApiUseTags('city')
    create(@Body() dto: { name: string, location: string }) {
        const city = new City();
        city.name = dto.name;
        city.date = new Date();
        city.location = dto.location;
        city.save()
    }

    @Get()
    @ApiUseTags('city')
    getAll() {
        return City.find()
    }
}
