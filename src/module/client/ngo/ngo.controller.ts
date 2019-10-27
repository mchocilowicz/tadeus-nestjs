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
import { CodeService } from "../../../common/service/code.service";
import { CityResponse } from "../../../models/response/city.response";
import { City } from "../../../database/entity/city.entity";
import { SelectedNgoRequest } from "../models/selected-ngo.request";
import { NgoQuery } from "../models/ngo.query";
import { UserDetails } from "../../../database/entity/user-details.entity";
import { DonationEnum } from "../../../common/enum/donation.enum";
import { Donation } from "../../../database/entity/donation.entity";
import { User } from "../../../database/entity/user.entity";
import { VirtualCard } from "../../../database/entity/virtual-card.entity";


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
    async selectedNgo(@Req() req: any, @Body() dto: SelectedNgoRequest) {
        let user: User = req.user;
        let ngo: Ngo | undefined = await Ngo.findOne({id: dto.id, verified: true, isTadeus: false});
        let details: UserDetails | undefined = user.details;
        let virtualCard: VirtualCard | undefined = user.card;

        if (!ngo) {
            throw new BadRequestException("ngo_does_not_exists")
        }

        if (!details || !virtualCard) {
            this.logger.error(`User details or Virtual Card for user ${user.id} does not exists.`);
            throw new BadRequestException("internal_server_error")
        }

        if (details.ngoSelectionCount === 2) {
            throw new BadRequestException("user_ngo_max_reached")
        } else if (details.ngoSelectionCount === 1) {
            if (details.ngo) {
                let price = virtualCard.donationPool;
                if (details.ngoTempMoney > 0) {
                    price += details.ngoTempMoney;
                    details.ngoTempMoney = 0;
                }

                const donation = new Donation(
                    this.codeService.generateDonationID(),
                    DonationEnum.NGO,
                    "DONATION",
                    price,
                    details.ngo,
                    user);

                virtualCard.donationPool = 0;
                details.ngoSelectionCount++;
                details.ngo = ngo;
                try {
                    await getConnection().transaction(async entityManager => {
                        await entityManager.save(donation);
                        await entityManager.save(virtualCard);
                        await entityManager.save(details);
                    });
                } catch (e) {
                    throw new BadRequestException("ngo_not_assigned")
                }
            }
        } else {
            details.ngo = ngo;
            virtualCard.donationPool += details.ngoTempMoney;
            details.ngoTempMoney = 0;
            details.ngoSelectionCount++;

            try {
                await getConnection().transaction(async entityManager => {
                    await entityManager.save(details);
                    await entityManager.save(virtualCard);
                });
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
    async getAll(@Query() query: NgoQuery) {
        let sqlQuery = createQueryBuilder('Ngo')
            .leftJoinAndSelect('Ngo.city', 'city')
            .leftJoinAndSelect('Ngo.type', 'ngoType');

        if (query['longitude'] && query['latitude']) {
            const lo = Number(query['longitude']);
            const la = Number(query['latitude']);

            const a = `ST_Distance(ST_Transform(Ngo.coordinate, 3857), ST_Transform('SRID=4326;POINT(${lo} ${la})'::geometry,3857)) * cosd(42.3521)`;
            const c: any = {};
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
            // @ts-ignore
            if (query[key] && key !== 'longitude' && key !== 'latitude') {
                // @ts-ignore
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

    @Get('/img/:imageName')
    @ApiUseTags('ngo')
    @ApiResponse({status: 200, type: "File", description: "Image"})
    getImage(@Param('imageName') imageName: string, @Res() res: any) {
        res.sendFile(imageName, {root: 'public/image'});
    }
}
