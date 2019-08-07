import { Body, Controller, Delete, Get, Post, Query } from "@nestjs/common";
import { NgoType } from "../../database/entity/ngo-type.entity";
import { Ngo } from "../../database/entity/ngo.entity";
import { CreateNgoDto } from "../../dto/create-ngo.dto";
import { createQueryBuilder } from "typeorm";
import { ApiImplicitHeader, ApiImplicitQuery, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { CreateNgoTypeDto } from "../../dto/create-ngoType.dto";


@Controller()
@ApiUseTags('ngo')
export class NgoController {

    @Post()
    @ApiImplicitHeader({
        name: 'Accept-Language',
        required: true,
        description: 'Language of returned Error message. [pl,eng]'
    })
    async create(@Body() dto: CreateNgoDto) {
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
    @ApiImplicitQuery({name: 'city', type: "string", description: 'city name', required: false})
    @ApiImplicitQuery({name: 'ngoType', type: "string", description: 'ngo type name', required: false})
    @ApiResponse({status: 200, type: Ngo, isArray: true})
    @ApiImplicitHeader({
        name: 'Accept-Language',
        required: true,
        description: 'Language of returned Error message. [pl,eng]'
    })
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
    @ApiImplicitHeader({
        name: 'Accept-Language',
        required: true,
        description: 'Language of returned Error message. [pl,eng]'
    })
    delete() {
    }

    @Get('type')
    @ApiResponse({status: 200, type: NgoType, isArray: true})
    @ApiImplicitHeader({
        name: 'Accept-Language',
        required: true,
        description: 'Language of returned Error message. [pl,eng]'
    })
    getNgoTypes() {
        return NgoType.find();
    }

    @Post('type')
    @ApiImplicitHeader({
        name: 'Accept-Language',
        required: true,
        description: 'Language of returned Error message. [pl,eng]'
    })
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
