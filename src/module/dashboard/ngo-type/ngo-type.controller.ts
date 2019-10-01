import { Body, Controller, Get, Logger, Param, Post, Put } from "@nestjs/common";
import { ApiImplicitBody, ApiImplicitHeader, ApiUseTags } from "@nestjs/swagger";
import { Const } from "../../../common/util/const";
import { handleException } from "../../../common/util/functions";
import { NgoTypeRequest } from "../../../models/request/ngo-type.request";
import { NgoType } from "../../../database/entity/ngo-type.entity";
import { createQueryBuilder } from "typeorm";

@Controller()
@ApiUseTags('dashboard/trading-point-type')
export class NgoTypeController {
    private readonly logger = new Logger(NgoTypeController.name);

    constructor() {
    }

    @Post()
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: NgoTypeRequest})
    async createNgoType(@Body() dto: NgoTypeRequest) {
        const type = new NgoType();
        type.name = dto.name;
        type.code = await this.getNgoCode();
        try {
            await createQueryBuilder('NgoType').insert().values(type).execute();
        } catch (e) {
            handleException(e, 'ngo_type', this.logger)
        }
    }

    @Put(':id')
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    async updateType(@Param('id') id: string, @Body() dto: any) {
        const type = await NgoType.findOne({id: id});
        type.name = dto.name;
        await type.save()
    }

    @Get()
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    getAllTypes() {
        return NgoType.find();
    }

    private async getNgoCode() {
        let code = null;

        while (!code) {
            const a = this.createCode(100, 1000);
            const b = await NgoType.findOne({code: a});
            if (!b) {
                code = a;
            }
        }
        return code;
    }

    private createCode(min: number, max: number) {
        return Math.floor(Math.random() * (max - min) + min);
    }
}
