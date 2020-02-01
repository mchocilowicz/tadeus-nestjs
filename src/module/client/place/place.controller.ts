import {Controller, Get, Logger, Query, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiHeader, ApiQuery, ApiResponse, ApiTags} from "@nestjs/swagger";
import {TradingPoint} from "../../../database/entity/trading-point.entity";
import {Const} from "../../../common/util/const";
import {TradingPointType} from "../../../database/entity/trading-point-type.entity";
import {CityResponse} from "../../../models/common/response/city.response";
import {PlaceQuery} from "../../../models/client/place.query";
import {Roles} from "../../../common/decorators/roles.decorator";
import {RoleEnum} from "../../../common/enum/role.enum";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";
import {City} from "../../../database/entity/city.entity";

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
    async getAll(@Query() query: PlaceQuery) {
        let sqlQuery = TradingPoint.createQueryBuilder('tradingPoint')
            .leftJoinAndSelect('tradingPoint.address', 'address')
            .leftJoinAndSelect('address.city', 'city')
            .leftJoinAndSelect('tradingPoint.type', 'placeType');

        if (query['longitude'] && query['latitude']) {
            const lo = Number(query['longitude']);
            const la = Number(query['latitude']);

            const a = `ST_Distance(ST_Transform(address.coordinate, 3857), ST_Transform('SRID=4326;POINT(${lo} ${la})'::geometry,3857)) * cosd(42.3521)`;
            const c: any = {};
            c[a] = {
                order: "ASC",
                nulls: "NULLS FIRST"
            };
            sqlQuery = sqlQuery.addSelect(a, 'address_distance');
            sqlQuery = sqlQuery.andWhere(`${a} > 0`)
                .orderBy(c).limit(10);
        }

        Object.keys(query).forEach((key: string) => {
            if (key !== 'longitude' && key !== 'latitude') {
                // @ts-ignore
                sqlQuery = sqlQuery.andWhere(`${key}.id = :id`, {id: query[key]})
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
