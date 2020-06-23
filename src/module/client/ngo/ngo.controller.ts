import {
    BadRequestException, Body, Controller, Get, HttpCode, Logger, Put, Query, Req, UseGuards
} from "@nestjs/common";
import { getConnection, SelectQueryBuilder } from "typeorm";
import { ApiBearerAuth, ApiBody, ApiHeader, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Ngo } from "../../../entity/ngo.entity";
import { Const } from "../../../common/util/const";
import { NgoType } from "../../../entity/ngo-type.entity";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleType } from "../../../common/enum/roleType";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { CityResponse } from "../../../models/common/response/city.response";
import { City } from "../../../entity/city.entity";
import { SelectedNgoRequest } from "../../../models/client/request/selected-ngo.request";
import { User } from "../../../entity/user.entity";
import { VirtualCard } from "../../../entity/virtual-card.entity";
import { LocationQueryService } from "../../common/location-query.service";
import { INgoQuery } from "../../../models/client/query/ngo-query.interface";
import { NgoQuery } from "../../../models/client/query/ngo.query";

const moment = require('moment');

@Controller()
export class NgoController {
    private readonly logger = new Logger(NgoController.name);

    @Put()
    @HttpCode(200) @ApiBearerAuth() @Roles(RoleType.CLIENT) @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    @ApiTags('ngo')
    @ApiBody({type: SelectedNgoRequest})
    async selectedNgo(@Req() req: any, @Body() dto: SelectedNgoRequest) {
        const user: User = req.user;
        const ngo: Ngo | undefined = await Ngo.findOne({id: dto.id, verified: true, isTadeus: false});
        const virtualCard: VirtualCard = user.card;

        if (!ngo) {
            throw new BadRequestException("ngo_does_not_exists")
        }

        if (!user.ngo) {
            virtualCard.status = 'ACTIVE';
            user.ngo = ngo;
        } else if (user.ngoSelectedAt) {
            let date = moment(user.ngoSelectedAt).add(30, 'days');
            if (moment().format(Const.DATE_FORMAT) < date.format(Const.DATE_FORMAT)) {
                throw new BadRequestException('ngo_not_allowed')
            }

            user.ngo = ngo;
            user.ngoSelectedAt = moment();
        } else {
            user.ngo = ngo;
            user.ngoSelectedAt = moment();
        }

        await getConnection().transaction(async entityManager => {
            await entityManager.save(virtualCard);
            await entityManager.save(user);
        });
    }

    @Get() @ApiBearerAuth() @Roles(RoleType.CLIENT) @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiQuery({name: 'city', type: "string", description: 'city id', required: false})
    @ApiQuery({name: 'ngoType', type: "string", description: 'ngo-type id', required: false})
    @ApiQuery({name: 'longitude', type: "number", description: 'longitude of user', required: false})
    @ApiQuery({name: 'latitude', type: "number", description: 'latitude of user', required: false})
    @ApiResponse({status: 200, type: Ngo, isArray: true})
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    @ApiTags('ngo')
    async getAll(@Query() query: INgoQuery) {
        let queryObject = new NgoQuery(query)

        let sqlQuery = Ngo.createQueryBuilder('ngo')
            .leftJoinAndSelect('ngo.address', 'address')
            .leftJoinAndSelect('address.city', 'city')
            .leftJoinAndSelect('ngo.type', 'ngoType');

        sqlQuery = LocationQueryService.addDistanceCalculationToQuery(queryObject, sqlQuery) as SelectQueryBuilder<Ngo>

        Object.keys(queryObject).forEach(key => {

            if (queryObject[key] && key !== 'longitude' && key !== 'latitude') {
                sqlQuery = sqlQuery.andWhere(`${ key }.id = :id`, {id: queryObject[key]})
            }
        });

        return await sqlQuery
            .andWhere('ngo.verified = true')
            .andWhere('ngo.isTadeus = false')
            .getMany()
    }

    @Get('type') @ApiBearerAuth() @Roles(RoleType.CLIENT) @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: NgoType, isArray: true})
    @ApiTags('ngo')
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    getNgoTypes() {
        return NgoType.find();
    }

    @Get('city') @ApiBearerAuth() @Roles(RoleType.CLIENT) @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: CityResponse, isArray: true})
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    @ApiTags('ngo')
    getCities() {
        return City.findWhereNgoExists();
    }
}
