import { Body, Controller, Delete, Get, Post, Query } from "@nestjs/common";
import { NgoType } from "../../entity/ngo-type.entity";
import { Ngo } from "../../entity/ngo.entity";
import { CreateNgoDto } from "../../dto/create-ngo.dto";

@Controller()
export class NgoController {

    @Post()
    async create(@Body() dto: CreateNgoDto) {
        console.log(dto);
        const ngo = new Ngo();
        ngo.address = dto.address;
        ngo.city = dto.city;
        ngo.location = dto.location;
        ngo.name = dto.name;
        ngo.type = dto.type;
        let newNgp = await ngo.save();
        console.log(newNgp);

    }

    @Get()
    getAll(@Query() query) {
    }

    @Delete()
    delete() {
    }

    @Get('type')
    getNgoTypes() {
        return NgoType.find();
    }

    @Post('type')
    createNgoType(@Body() dto: { name: string }) {
        const type = new NgoType();
        type.name = dto.name;
        type.save()
    }

}
