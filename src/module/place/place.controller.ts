import { BadRequestException, Body, Controller, Delete, Get, Post, Query } from "@nestjs/common";
import { PlaceType } from "../../entity/place-type.entity";
import { createQueryBuilder } from "typeorm";
import { ApiUseTags } from "@nestjs/swagger";

@Controller()
export class PlaceController {

    @Post()
    @ApiUseTags('place')
    create() {
    }

    @Get()
    @ApiUseTags('place')
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
    getPlaceTypes() {
        return PlaceType.find()
    }

    @Post('type')
    @ApiUseTags('place')
    async savePlaceType(@Body() dto: { name: string }) {
        const type = new PlaceType();
        type.name = dto.name;
        try {
            await type.save();    
        } catch (e) {
            throw new BadRequestException("Could not create new Place")
        }

    }

}
