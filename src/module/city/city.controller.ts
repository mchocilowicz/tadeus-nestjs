import { BadRequestException, Body, Controller, Get, Post } from "@nestjs/common";
import { City } from "../../entity/city.entity";
import { ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { CreateCityDto } from "../../dto/create-city.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { RoleEnum } from "../../common/enum/role.enum";

@Controller()
export class CityController {
    @Post()
    @ApiUseTags('city')
    @ApiResponse({status: 201, type: City})
    async create(@Body() dto: CreateCityDto): Promise<City> {
        const city = new City();
        city.name = dto.name;
        city.location = dto.location;
        try {
            return await city.save()
        } catch (e) {
            throw new BadRequestException("Could not create city")
        }
    }

    @Get()
    @Roles(RoleEnum.CLIENT)
    @ApiUseTags('city')
    @ApiResponse({status: 200, type: City, isArray: true})
    getAll(): Promise<City[]> {
        return City.find()
    }
}
