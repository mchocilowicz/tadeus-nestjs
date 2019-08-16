import { Body, Controller, Get, Post } from "@nestjs/common";
import { Configuration } from "../../../database/entity/configuration.entity";

@Controller()
export class ConfigurationController {

    @Post()
    async save(@Body() dto: any) {
        let config = await Configuration.findOne({type: 'MAIN'});
        if (!config) {
            config = new Configuration();
        }
        this.mapDtoToEntity(dto, config);
        await config.save();
    }

    @Get()
    async getConfiguration() {
        return await Configuration.findOne({type: 'MAIN'});
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
