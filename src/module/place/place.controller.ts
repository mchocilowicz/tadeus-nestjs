import { BadRequestException, Body, Controller, Delete, Get, Post, Query } from "@nestjs/common";
import { PlaceType } from "../../entity/place-type.entity";
import { createQueryBuilder } from "typeorm";
import { ApiImplicitQuery, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { CreatePlaceTypeDto } from "../../dto/create-placeType.dto";
import { City } from "../../entity/city.entity";
import { Place } from "../../entity/place.entity";

@Controller()
export class PlaceController {

    @Post()
    @ApiUseTags('place')
    create() {
    }

    @Get()
    @ApiUseTags('place')
    @ApiImplicitQuery({ name: 'city', type:"string", description: 'city name', required: false})
    @ApiImplicitQuery({ name: 'placeType', type: "string", description: 'place type name', required: false})
    @ApiResponse({status: 200, type: Place, isArray: true})
    async getAll(@Query() query: { city: string, placeType: string }) {
        let sqlQuery = createQueryBuilder('Place')
            .leftJoinAndSelect('Place.city', 'city')
            .leftJoinAndSelect('Place.type', 'placeType');

        Object.keys(query).forEach(key => {
            if (query[key]) {
                sqlQuery = sqlQuery.andWhere(`${key}.name = :name`, {name: query[key]})
            }
        });

        return await sqlQuery.getMany()
    }

    @Delete()
    @ApiUseTags('place')
    delete() {
    }

    @Get('type')
    @ApiUseTags('place')
    @ApiResponse({status: 200, type: PlaceType, isArray: true})
    getPlaceTypes() {
        return PlaceType.find()
    }

    @Post('type')
    @ApiUseTags('place')
    async savePlaceType(@Body() dto: CreatePlaceTypeDto) {
        const type = new PlaceType();
        type.name = dto.name;
        try {
            await type.save();
        } catch (e) {
            throw new BadRequestException("Could not create new Place")
        }

    }

}
