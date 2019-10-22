import { Controller, Get, Logger, Param, Query, Res } from "@nestjs/common";
import { createQueryBuilder } from "typeorm";
import { ApiImplicitHeader, ApiImplicitQuery, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { TradingPoint } from "../../../database/entity/trading-point.entity";
import { Const } from "../../../common/util/const";
import { TradingPointType } from "../../../database/entity/trading-point-type.entity";
import { CityResponse } from "../../../models/response/city.response";

@Controller()
@ApiUseTags('place')
export class PlaceController {
    private readonly logger = new Logger(PlaceController.name);

    @Get()
    @ApiImplicitQuery({name: 'city', type: "string", description: 'city id', required: false})
    @ApiImplicitQuery({name: 'placeType', type: "string", description: 'place-type id', required: false})
    @ApiImplicitQuery({name: 'longitude', type: "number", description: 'longitude of user', required: false})
    @ApiImplicitQuery({name: 'latitude', type: "number", description: 'latitude of user', required: false})
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

        if (query['longitude'] && query['latitude']) {
            const lo = Number(query['longitude']);
            const la = Number(query['latitude']);

            const a = `ST_Distance(ST_Transform(TradingPoint.coordinate, 3857), ST_Transform('SRID=4326;POINT(${lo} ${la})'::geometry,3857)) * cosd(42.3521)`;
            const c = {};
            c[a] = {
                order: "ASC",
                nulls: "NULLS FIRST"
            };
            sqlQuery = sqlQuery.addSelect(a, 'TradingPoint_distance');
            sqlQuery = sqlQuery.andWhere(`${a} > 0`)
                .orderBy(c).limit(10);
        }

        Object.keys(query).forEach(key => {
            if (key !== 'longitude' && key !== 'latitude') {
                sqlQuery = sqlQuery.andWhere(`${key}.id = :id`, {id: query[key]})
            }
        });
        return await sqlQuery
            .andWhere('TradingPoint.active = true')
            .getMany();
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

    @Get('city')
    @ApiResponse({status: 200, type: CityResponse, isArray: true})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    getCities() {
        return createQueryBuilder('City', 'city')
            .innerJoin('city.places', 'place')
            .getMany()
    }

    @Get('/img/:name')
    getImage(@Param('name') imageName: string, @Res() response) {
        response.sendFile(imageName, {root: 'public/image'});
    }
}
