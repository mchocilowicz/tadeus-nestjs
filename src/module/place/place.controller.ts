import { BadRequestException, Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { TradingPointType } from "../../database/entity/trading-point-type.entity";
import { createQueryBuilder } from "typeorm";
import { ApiImplicitHeader, ApiImplicitQuery, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { TradingPoint } from "../../database/entity/trading-point.entity";
import { TradingPointTypeRequest } from "../../models/request/trading-point-type.request";
import { Const } from "../../common/util/const";

@Controller()
@ApiUseTags('place')
export class PlaceController {

    @Get()
    @ApiImplicitQuery({name: 'city', type: "string", description: 'city name', required: false})
    @ApiImplicitQuery({name: 'placeType', type: "string", description: 'place type name', required: false})
    @ApiResponse({status: 200, type: TradingPoint, isArray: true})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
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
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiResponse({status: 200, type: TradingPointType, isArray: true})
    getPlaceTypes() {
        return TradingPointType.find()
    }

    @Post('type')
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    async savePlaceType(@Body() dto: TradingPointTypeRequest) {
        const type = new TradingPointType();
        type.name = dto.name;
        try {
            await type.save();
        } catch (e) {
            throw new BadRequestException("trading_point_type_not_created")
        }
    }

    @Put('type/:id')
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    async updateType(@Param('id') id: string, @Body() dto: any) {
        const type = await TradingPointType.findOne({id: id});
        type.name = dto.name;
        await type.save()
    }
}
