import { Body, Controller, Get, Post } from "@nestjs/common";
import { Configuration } from "../../../database/entity/configuration.entity";
import { ApiTags } from "@nestjs/swagger";
import { ConfigurationRequest, PeriodRequest } from "../../../models/dashboard/request/configuration.request";
import { Period } from "../../../database/entity/period.entity";
import { getConnection } from "typeorm";

const moment = require('moment');

@Controller()
@ApiTags('configuration')
export class ConfigurationController {

    @Post()
    async save(@Body() dto: ConfigurationRequest) {
        return await getConnection().transaction(async entityManager => {
            let config = await Configuration.getMain();
            if (!config) {
                config = new Configuration();
            }

            config.minNgoTransfer = dto.minNgoTransfer;
            config.minPersonalPool = dto.minPersonalPool;
            config.userExpirationAfterDays = dto.userExpiration;

            let ngoPeriod = await Period.findCurrentNgoPeriod();
            let partnerPeriod = await Period.findCurrentPartnerPeriod();
            let clientPeriod = await Period.findCurrentClientPeriod();

            ngoPeriod = this.updatePeriod(dto.ngoPeriod, 'NGO', ngoPeriod);
            partnerPeriod = this.updatePeriod(dto.partnerPeriod, 'PARTNER', partnerPeriod);
            clientPeriod = this.updatePeriod(dto.clientPeriod, 'CLIENT', clientPeriod);

            let savedConfig = await entityManager.save(config);
            clientPeriod = await entityManager.save(clientPeriod);
            partnerPeriod.relation = clientPeriod;
            partnerPeriod = await entityManager.save(partnerPeriod);
            ngoPeriod.relation = partnerPeriod;
            ngoPeriod = await entityManager.save(ngoPeriod);

            return this.mapToResponse(savedConfig, ngoPeriod, partnerPeriod, clientPeriod)
        })
    }

    @Get()
    async getConfiguration() {
        let config = await Configuration.getMain();
        let ngoPeriod = await Period.findCurrentNgoPeriod();
        let partnerPeriod = await Period.findCurrentPartnerPeriod();
        let clientPeriod = await Period.findCurrentClientPeriod();

        if (config && ngoPeriod && partnerPeriod && clientPeriod) {
            return this.mapToResponse(config, ngoPeriod, partnerPeriod, clientPeriod)
        }
        return null;
    }

    private updatePeriod(request: PeriodRequest, type: string, period?: Period) {
        if (period) {
            period.from = request.from;
            period.interval = request.interval;
            return period;
        } else {
            return new Period(request.from, moment(request.from).add(request.interval, 'days'), request.interval, type)
        }
    }

    private mapToResponse(config: Configuration, ngo: Period, partner: Period, client: Period) {
        let ngoRequest = new PeriodRequest(ngo.from, ngo.interval);
        let partnerRequest = new PeriodRequest(partner.from, partner.interval);
        let clientRequest = new PeriodRequest(client.from, client.interval);

        return new ConfigurationRequest(
            config.minNgoTransfer,
            config.minPersonalPool,
            config.userExpirationAfterDays,
            ngoRequest,
            clientRequest,
            partnerRequest);
    }

}
