import {BadRequestException, Body, Controller, Get, HttpCode, Logger, Put, Query, Req, UseGuards} from "@nestjs/common";
import {getConnection} from "typeorm";
import {ApiBearerAuth, ApiBody, ApiHeader, ApiQuery, ApiResponse, ApiTags} from "@nestjs/swagger";
import {Ngo} from "../../../entity/ngo.entity";
import {Const} from "../../../common/util/const";
import {NgoType} from "../../../entity/ngo-type.entity";
import {Roles} from "../../../common/decorators/roles.decorator";
import {RoleEnum} from "../../../common/enum/role.enum";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";
import {CityResponse} from "../../../models/common/response/city.response";
import {City} from "../../../entity/city.entity";
import {SelectedNgoRequest} from "../../../models/client/request/selected-ngo.request";
import {NgoQuery} from "../../../models/client/ngo.query";
import {User} from "../../../entity/user.entity";
import {VirtualCard} from "../../../entity/virtual-card.entity";

const moment = require('moment');

@Controller()
export class NgoController {
    private readonly logger = new Logger(NgoController.name);

    @Put()
    @HttpCode(200)
    @ApiBearerAuth()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
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

    @Get()
    @ApiBearerAuth()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiQuery({name: 'city', type: "string", description: 'city id', required: false})
    @ApiQuery({name: 'ngoType', type: "string", description: 'ngo-type id', required: false})
    @ApiQuery({name: 'longitude', type: "number", description: 'longitude of user', required: false})
    @ApiQuery({name: 'latitude', type: "number", description: 'latitude of user', required: false})
    @ApiResponse({status: 200, type: Ngo, isArray: true})
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    @ApiTags('ngo')
    async getAll(@Query() query: NgoQuery) {
        let sqlQuery = Ngo.createQueryBuilder('ngo')
            .leftJoinAndSelect('ngo.address', 'address')
            .leftJoinAndSelect('address.city', 'city')
            .leftJoinAndSelect('ngo.type', 'ngoType');

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
                .orderBy(c)
                .limit(10);
        }

        Object.keys(query).forEach(key => {
            // @ts-ignore
            if (query[key] && key !== 'longitude' && key !== 'latitude') {
                // @ts-ignore
                sqlQuery = sqlQuery.andWhere(`${key}.id = :id`, {id: query[key]})
            }
        });

        return await sqlQuery
            .andWhere('ngo.verified = true')
            .andWhere('ngo.isTadeus = false')
            .getMany()
    }

    @Get('type')
    @ApiBearerAuth()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: NgoType, isArray: true})
    @ApiTags('ngo')
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    getNgoTypes() {
        return NgoType.find();
    }

    @Get('city')
    @ApiBearerAuth()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: CityResponse, isArray: true})
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    @ApiTags('ngo')
    getCities() {
        return City.findWhereNgoExists();
    }
}
