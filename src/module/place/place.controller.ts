import { Controller, Get, Logger, Query } from "@nestjs/common";
import { TradingPointType } from "../../database/entity/trading-point-type.entity";
import { createQueryBuilder } from "typeorm";
import { ApiImplicitHeader, ApiImplicitQuery, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { TradingPoint } from "../../database/entity/trading-point.entity";
import { Const } from "../../common/util/const";

@Controller()
@ApiUseTags('place')
export class PlaceController {
    private readonly logger = new Logger(PlaceController.name);

    @Get()
    @ApiImplicitQuery({name: 'city', type: "string", description: 'city id', required: false})
    @ApiImplicitQuery({name: 'placeType', type: "string", description: 'place-type id', required: false})
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
                sqlQuery = sqlQuery.andWhere(`${key}.id = :id`, {id: query[key]})
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
}
