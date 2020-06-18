import { Controller, Get, Logger, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TradingPoint } from "../../../entity/trading-point.entity";
import { Const } from "../../../common/util/const";
import { TradingPointType } from "../../../entity/trading-point-type.entity";
import { CityResponse } from "../../../models/common/response/city.response";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleEnum } from "../../../common/enum/role.enum";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { City } from "../../../entity/city.entity";
import { LocationQueryService } from "../../common/location-query.service";
import { SelectQueryBuilder } from "typeorm";
import { PlaceQuery } from "../../../models/client/query/place.query";
import { IPlaceQuery } from "../../../models/client/query/place-query.interface";

@Controller()
@ApiTags('place')
@ApiBearerAuth()
@ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
@ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
export class PlaceController {
    private readonly logger = new Logger(PlaceController.name);

    @Get()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiQuery({name: 'city', type: "string", description: 'city id', required: false})
    @ApiQuery({name: 'placeType', type: "string", description: 'place-type id', required: false})
    @ApiQuery({name: 'longitude', type: "number", description: 'longitude of user', required: false})
    @ApiQuery({name: 'latitude', type: "number", description: 'latitude of user', required: false})
    @ApiResponse({status: 200, type: TradingPoint, isArray: true})
    async getAll(@Query() query: IPlaceQuery) {
        const queryObject = new PlaceQuery(query);

        let sqlQuery = TradingPoint.createQueryBuilder('tradingPoint')
            .leftJoinAndSelect('tradingPoint.address', 'address')
            .leftJoinAndSelect('address.city', 'city')
            .leftJoinAndSelect('tradingPoint.type', 'placeType');

        sqlQuery = LocationQueryService.addDistanceCalculationToQuery(queryObject, sqlQuery) as SelectQueryBuilder<TradingPoint>

        Object.keys(queryObject).forEach((key: string) => {
            if (queryObject[key] && key !== 'longitude' && key !== 'latitude') {
                sqlQuery = sqlQuery.andWhere(`${ key }.id = :id`, {id: queryObject[key]})
            }
        });

        return await sqlQuery
            .andWhere('tradingPoint.active = true')
            .getMany();
    }

    @Get('type')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: TradingPointType, isArray: true})
    getPlaceTypes() {
        return TradingPointType.find()
    }

    @Get('city')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: CityResponse, isArray: true})
    getCities() {
        return City.findWhereTradingPointExists();
    }
}
