import { BadRequestException, Body, Controller, Get, HttpCode, Param, Post, Put } from "@nestjs/common";
import { City } from "../../database/entity/city.entity";
import { ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { CreateCityDto } from "../../dto/create-city.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { RoleEnum } from "../../common/enum/role.enum";

@Controller()
@ApiUseTags('city')
export class CityController {

    @Post()
    @HttpCode(200)
    @ApiResponse({status: 200, type: City})
    @ApiImplicitHeader({
        name: 'Accept-Language',
        required: true,
        description: 'Language of returned Error message. [pl,eng]'
    })
    async create(@Body() dto: CreateCityDto) {
        const city = new City();
        city.name = dto.name;
        try {
            return await city.save()
        } catch (e) {
            throw new BadRequestException("Could not create city")
        }
    }

    @Get()
    @Roles(RoleEnum.CLIENT)
    @ApiResponse({status: 200, type: City, isArray: true})
    @ApiImplicitHeader({
        name: 'Accept-Language',
        required: true,
        description: 'Language of returned Error message. [pl,eng]'
    })
    getAll() {
        return City.find()
    }

    @Put(':id')
    @ApiImplicitHeader({
        name: 'Accept-Language',
        required: true,
        description: 'Language of returned Error message. [pl,eng]'
    })
    async updateCity(@Param('id') id: string, @Body() body) {
        let city = await City.findOne({id: id});
        city.name = body.name;
        await city.save()
    }

}
