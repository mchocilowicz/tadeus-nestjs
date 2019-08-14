import { BadRequestException, Body, Controller, Get, Post, Put } from "@nestjs/common";
import { Configuration } from "../../../database/entity/configuration.entity";

@Controller()
export class ConfigurationController {

    @Post()
    async save(@Body() dto: any) {
        let count = await Configuration.count();
        if (count === 1) {
            throw new BadRequestException('configuration_exists')
        } else {
            let config = new Configuration();
            this.mapDtoToEntity(dto, config);
            await config.save();
        }
    }

    @Get()
    async getConfiguration() {
        return await Configuration.findOne({type: 'MAIN'});
    }

    @Put()
    async updateConfiguration(@Body() dto: any) {
        let config = await Configuration.findOne({type: 'MAIN'});
        this.mapDtoToEntity(dto, config);
        await config.save();
    }

    mapDtoToEntity(dto: any, config: Configuration) {
        config.minNgoTransfer = dto.minNgoTransfer;
        config.minPersonalPool = dto.minPersonalPool;
        config.currentClientPaymentDate = dto.currentClientPaymentDate;
        config.clientCycleDays = dto.clientCycleDays;
        config.nextClientPaymentDate = dto.nextClientPaymentDate;
        config.currentPartnerPaymentDate = dto.currentPartnerPaymentDate;
        config.partnerCycleDays = dto.partnerCycleDays;
        config.nextPartnerPaymentDate = dto.nextPartnerPaymentDate;
        config.currentNgoPaymentDate = dto.currentNgoPaymentDate;
        config.ngoCycleDays = dto.ngoCycleDays;
        config.nextNgoPaymentDate = dto.nextNgoPaymentDate;
    }
}
