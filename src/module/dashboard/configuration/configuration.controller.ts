import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { Configuration } from "../../../database/entity/configuration.entity";
import { ApiUseTags } from "@nestjs/swagger";

const moment = require('moment');

@Controller()
@ApiUseTags('dashboard/configuration')
export class ConfigurationController {

    @Post()
    async save(@Body() dto: any) {
        let config = await Configuration.findOne({type: 'MAIN'});
        if (!config) {
            config = new Configuration();
        }
        this.mapDtoToEntity(dto, config);
        const c = moment().subtract(5, 'months').toDate();
        config.oldClientPaymentDate = c;
        config.oldNgoPaymentDate = c;
        config.oldPartnerPaymentDate = c;
        await config.save();
    }

    @Get()
    async getConfiguration() {
        return await Configuration.findOne({type: 'MAIN'});
    }

    @Put(':id')
    async updateConfiguration(@Param('id') id: string, dto: any) {
        let config = await Configuration.findOne({id: id});
        this.mapDtoToEntity(dto, config);
        await config.save()
    }

    mapDtoToEntity(dto: any, config: Configuration) {
        config.minNgoTransfer = Number(dto.minNgoTransfer);
        config.minPersonalPool = Number(dto.minPersonalPool);
        config.currentClientPaymentDate = dto.currentClientPaymentDate;
        config.clientCycleDays = Number(dto.clientCycleDays);
        config.nextClientPaymentDate = dto.nextClientPaymentDate;
        config.currentPartnerPaymentDate = dto.currentPartnerPaymentDate;
        config.partnerCycleDays = Number(dto.partnerCycleDays);
        config.nextPartnerPaymentDate = dto.nextPartnerPaymentDate;
        config.currentNgoPaymentDate = dto.currentNgoPaymentDate;
        config.ngoCycleDays = Number(dto.ngoCycleDays);
        config.nextNgoPaymentDate = dto.nextNgoPaymentDate;
    }
}
