import { BadRequestException, Body, Controller, Delete, Get, Post, Query } from "@nestjs/common";
import { TradingPointType } from "../../database/entity/trading-point-type.entity";
import { createQueryBuilder } from "typeorm";
import { ApiImplicitQuery, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { CreatePlaceTypeDto } from "../../dto/create-placeType.dto";
import { TradingPoint } from "../../database/entity/trading-point.entity";

@Controller()
export class PlaceController {

    @Post()
    @ApiUseTags('place')
    create() {
    }

    @Get()
    @ApiUseTags('place')
    @ApiImplicitQuery({name: 'city', type: "string", description: 'city name', required: false})
    @ApiImplicitQuery({name: 'placeType', type: "string", description: 'place type name', required: false})
    @ApiResponse({status: 200, type: TradingPoint, isArray: true})
    async getAll(@Query() query: { city: string, placeType: string }) {
        let sqlQuery = createQueryBuilder('TradingPoint')
            .leftJoinAndSelect('TradingPoint.city', 'city')
            .leftJoinAndSelect('TradingPoint.type', 'placeType');

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
    @ApiResponse({status: 200, type: TradingPointType, isArray: true})
    getPlaceTypes() {
        return TradingPointType.find()
    }

    @Post('type')
    @ApiUseTags('place')
    async savePlaceType(@Body() dto: CreatePlaceTypeDto) {
        const type = new TradingPointType();
        type.name = dto.name;
        try {
            await type.save();
        } catch (e) {
            throw new BadRequestException("Could not create new TradingPoint")
        }

    }

}
