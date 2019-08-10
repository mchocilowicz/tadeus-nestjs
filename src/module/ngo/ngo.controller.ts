import { Body, Controller, Delete, Get, Post, Query } from "@nestjs/common";
import { NgoType } from "../../database/entity/ngo-type.entity";
import { Ngo } from "../../database/entity/ngo.entity";
import { createQueryBuilder } from "typeorm";
import { ApiImplicitBody, ApiImplicitHeader, ApiImplicitQuery, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { NgoRequest } from "../../models/request/ngo.request";
import { Const } from "../../common/util/const";
import { NgoTypeRequest } from "../../models/request/ngo-type.request";

@Controller()
@ApiUseTags('ngo')
export class NgoController {

    @Post()
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: NgoRequest})
    async create(@Body() dto: NgoRequest) {
        console.log(dto);
        const ngo = new Ngo();
        ngo.address = dto.address;
        ngo.city = dto.city;
        ngo.location = dto.location;
        ngo.name = dto.name;
        ngo.type = dto.type;
        ngo.bankNumber = dto.bankNumber;
        ngo.email = dto.email;
        ngo.phone = dto.phone;
        const result = await createQueryBuilder('Ngo').insert().values(ngo).execute();
        console.log(result);
    }

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

    @Delete()
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    delete() {
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

    @Post('type')
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: NgoTypeRequest})
    async createNgoType(@Body() dto: NgoTypeRequest) {
        const type = new NgoType();
        type.name = dto.name;
        try {
            await createQueryBuilder('NgoType').insert().values(type).execute();
        } catch (e) {
            console.log(e)
        }
    }

}
