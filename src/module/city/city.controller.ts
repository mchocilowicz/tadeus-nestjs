import { Body, Controller, Get, Post } from "@nestjs/common";
import { City } from "../../entity/city.entity";

@Controller()
export class CityController {
    @Post()
    create(@Body() dto: { name: string, location: string }) {
        const city = new City();
        city.name = dto.name;
        city.location = dto.location;
        city.save()
    }

    @Get()
    getAll() {
        return City.find()
    }
}
