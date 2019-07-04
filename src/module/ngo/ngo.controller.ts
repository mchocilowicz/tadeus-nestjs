import { Body, Controller, Delete, Get, Post, Query } from "@nestjs/common";
import { NgoType } from "../../entity/ngo-type.entity";
import { Ngo } from "../../entity/ngo.entity";
import { CreateNgoDto } from "../../dto/create-ngo.dto";
import { createQueryBuilder } from "typeorm";
import { ApiImplicitQuery, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { CreateNgoTypeDto } from "../../dto/create-ngoType.dto";


@Controller()
export class NgoController {

    @Post()
    @ApiUseTags('ngo')
    async create(@Body() dto: CreateNgoDto) {
        console.log(dto);
        const ngo = new Ngo();
        ngo.address = dto.address;
        ngo.city = dto.city;
        ngo.location = dto.location;
        ngo.name = dto.name;
        ngo.type = dto.type;
        const result = await createQueryBuilder('Ngo').insert().values(ngo).execute();
        console.log(result);
    }

    @Get()
    @ApiUseTags('ngo')
    @ApiImplicitQuery({ name: 'city', type:"string", description: 'city name', required: false})
    @ApiImplicitQuery({ name: 'ngoType', type: "string", description: 'ngo type name', required: false})
    @ApiResponse({status: 200, type: Ngo, isArray: true})
    async getAll(@Query() query: { city: string, ngoType: string }) {
        let sqlQuery = createQueryBuilder('Ngo')
            .leftJoinAndSelect('Ngo.city', 'city')
            .leftJoinAndSelect('Ngo.type', 'ngoType');

        Object.keys(query).forEach(key => {
            if (query[key]) {
                sqlQuery = sqlQuery.andWhere(`${key}.name = :name`, {name: query[key]})
            }
        });

        return await sqlQuery.getMany()
    }

    @Delete()
    @ApiUseTags('ngo')
    delete() {
    }

    @Get('type')
    @ApiUseTags('ngo')
    @ApiResponse({status: 200, type: NgoType, isArray: true})
    getNgoTypes() {
        return NgoType.find();
    }

    @Post('type')
    @ApiUseTags('ngo')
    async createNgoType(@Body() dto: CreateNgoTypeDto) {
        const type = new NgoType();
        type.name = dto.name;
        try {
            const a = await createQueryBuilder('NgoType').insert().values(type).execute();
            console.log(a)
        } catch (e) {
            console.log(e)
        }
    }

}
