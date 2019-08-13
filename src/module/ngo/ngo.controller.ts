import { Controller, Get, Logger, Query } from "@nestjs/common";
import { NgoType } from "../../database/entity/ngo-type.entity";
import { Ngo } from "../../database/entity/ngo.entity";
import { createQueryBuilder } from "typeorm";
import { ApiImplicitHeader, ApiImplicitQuery, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { Const } from "../../common/util/const";

@Controller()
@ApiUseTags('ngo')
export class NgoController {
    private readonly logger = new Logger(NgoController.name);

    @Get()
    @ApiImplicitQuery({name: 'city', type: "string", description: 'city id', required: false})
    @ApiImplicitQuery({name: 'ngoType', type: "string", description: 'ngo-type id', required: false})
    @ApiResponse({status: 200, type: Ngo, isArray: true})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    async getAll(@Query() query: { city: string, ngoType: string }) {
        let sqlQuery = createQueryBuilder('Ngo')
            .leftJoinAndSelect('Ngo.city', 'city')
            .leftJoinAndSelect('Ngo.type', 'ngoType');

        Object.keys(query).forEach(key => {
            if (query[key]) {
                sqlQuery = sqlQuery.andWhere(`${key}.id = :id`, {id: query[key]})
            }
        });

        return await sqlQuery.getMany()
    }

    @Get('type')
    @ApiResponse({status: 200, type: NgoType, isArray: true})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    getNgoTypes() {
        return NgoType.find();
    }
}
