import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    Logger,
    Param,
    Put,
    Query,
    Req,
    Res,
    UseGuards
} from "@nestjs/common";
import { createQueryBuilder, getConnection } from "typeorm";
import { ApiImplicitBody, ApiImplicitHeader, ApiImplicitQuery, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { Ngo } from "../../../database/entity/ngo.entity";
import { Const } from "../../../common/util/const";
import { NgoType } from "../../../database/entity/ngo-type.entity";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleEnum } from "../../../common/enum/role.enum";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { User } from "../../../database/entity/user.entity";
import { Donation } from "../../../database/entity/donation.entity";
import { DonationEnum } from "../../../common/enum/donation.enum";
import { CodeService } from "../../../common/service/code.service";
import { CityResponse } from "../../../models/response/city.response";
import { City } from "../../../database/entity/city.entity";
import { SelectedNgoRequest } from "../models/selected-ngo.request";


@Controller()
export class NgoController {
    private readonly logger = new Logger(NgoController.name);

    constructor(private readonly codeService: CodeService) {
    }

    @Put()
    @HttpCode(200)
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitHeader({
        name: Const.HEADER_AUTHORIZATION,
        required: true,
        description: Const.HEADER_AUTHORIZATION_DESC
    })
    @ApiUseTags('ngo')
    @ApiImplicitBody({name: '', type: SelectedNgoRequest})
    async selectedNgo(@Req() req, @Body() dto: SelectedNgoRequest) {
        let user: User = req.user;
        let ngo = await Ngo.findOne({id: dto.id});
        if (user.details.ngoSelectionCount > 2) {
            throw new BadRequestException("user_ngo_max_reached")
        } else if (user.details.ngoSelectionCount === 1) {
            const donation = new Donation();
            donation.type = DonationEnum.NGO;
            donation.price = user.card.donationPool;
            user.card.donationPool -= user.card.donationPool;
            donation.user = user;
            donation.ngo = user.details.ngo;
            donation.pool = 'DONATION';
            donation.ID = this.codeService.generateDonationID();
            user.details.ngo = ngo;
            await getConnection().transaction(async entityManager => {
                await entityManager.save(donation);
                await entityManager.save(user);
            });
        } else {
            user.details.ngo = ngo;
            user.details.ngoSelectionCount++;
            try {
                await user.save()
            } catch (e) {
                throw new BadRequestException("ngo_not_assigned")
            }
        }
    }

    @Get()
    @ApiImplicitQuery({name: 'city', type: "string", description: 'city id', required: false})
    @ApiImplicitQuery({name: 'ngoType', type: "string", description: 'ngo-type id', required: false})
    @ApiImplicitQuery({name: 'longitude', type: "number", description: 'longitude of user', required: false})
    @ApiImplicitQuery({name: 'latitude', type: "number", description: 'latitude of user', required: false})
    @ApiResponse({status: 200, type: Ngo, isArray: true})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiUseTags('ngo')
    async getAll(@Query() query: { city: string, ngoType: string }) {
        let sqlQuery = createQueryBuilder('Ngo')
            .leftJoinAndSelect('Ngo.city', 'city')
            .leftJoinAndSelect('Ngo.type', 'ngoType');

        if (query['longitude'] && query['latitude']) {
            const lo = Number(query['longitude']);
            const la = Number(query['latitude']);

            const a = `ST_Distance(ST_Transform(Ngo.coordinate, 3857), ST_Transform('SRID=4326;POINT(${lo} ${la})'::geometry,3857)) * cosd(42.3521)`;
            const c = {};
            c[a] = {
                order: "ASC",
                nulls: "NULLS FIRST"
            };
            sqlQuery = sqlQuery.addSelect(a, 'Ngo_distance');
            sqlQuery = sqlQuery.andWhere(`${a} > 0`)
                .orderBy(c)
                .limit(10);
        }

        Object.keys(query).forEach(key => {
            if (query[key] && key !== 'longitude' && key !== 'latitude') {
                sqlQuery = sqlQuery.andWhere(`${key}.id = :id`, {id: query[key]})
            }
        });

        return await sqlQuery
            .andWhere('Ngo.verified = true')
            .andWhere('Ngo.isTadeus = false')
            .getMany()
    }

    @Get('type')
    @ApiResponse({status: 200, type: NgoType, isArray: true})
    @ApiUseTags('ngo')
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    getNgoTypes() {
        return NgoType.find();
    }

    @Get('city')
    @ApiResponse({status: 200, type: CityResponse, isArray: true})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiUseTags('ngo')
    getCities() {
        return createQueryBuilder('City', 'city')
            .innerJoin('city.ngoList', 'ngo')
            .getMany()
    }

    @Get('/img/:name')
    @ApiUseTags('ngo')
    @ApiResponse({status: 200, type: "File", description: "Image"})
    getImage(@Param('name') imageName: string, @Res() response) {
        response.sendFile(imageName, {root: 'public/image'});
    }
}
