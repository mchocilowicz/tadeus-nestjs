import { BadRequestException, Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { TradingPointType } from "../../database/entity/trading-point-type.entity";
import { createQueryBuilder } from "typeorm";
import { ApiImplicitQuery, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { CreatePlaceTypeDto } from "../../dto/create-placeType.dto";
import { TradingPoint } from "../../database/entity/trading-point.entity";

@Controller()
@ApiUseTags('place')
export class PlaceController {

    @Get()
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

    @Get('type')
    @ApiResponse({status: 200, type: TradingPointType, isArray: true})
    getPlaceTypes() {
        return TradingPointType.find()
    }

    @Post('type')
    async savePlaceType(@Body() dto: CreatePlaceTypeDto) {
        const type = new TradingPointType();
        type.name = dto.name;
        try {
            await type.save();
        } catch (e) {
            throw new BadRequestException("Could not create new TradingPoint")
        }
    }

    @Put('type/:id')
    async updateType(@Param('id') id: string, @Body() dto: any) {
        const type = await TradingPointType.findOne({id: id});
        type.name = dto.name;
        await type.save()
    }
}
