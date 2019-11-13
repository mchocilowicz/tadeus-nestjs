import {Body, Controller, Get, NotFoundException, Post, Put} from "@nestjs/common";
import {Configuration} from "../../../database/entity/configuration.entity";
import {ApiUseTags} from "@nestjs/swagger";
import {ConfigurationRequest, PeriodRequest} from "../../../models/dashboard/request/configuration.request";
import {Period} from "../../../database/entity/period.entity";
import {getConnection} from "typeorm";

const moment = require('moment');

@Controller()
@ApiUseTags('configuration')
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
            ngoPeriod = this.updatePeriod(dto.ngoPeriod, 'NGO', ngoPeriod);

            let partnerPeriod = await Period.findCurrentPartnerPeriod();
            partnerPeriod = this.updatePeriod(dto.partnerPeriod, 'PARTNER', partnerPeriod);

            let clientPeriod = await Period.findCurrentClientPeriod();
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

    @Put()
    async updateConfiguration(dto: ConfigurationRequest) {
        return await getConnection().transaction(async entityManager => {
            let config = await Configuration.getMain();
            let ngoPeriod = await Period.findCurrentNgoPeriod();
            let partnerPeriod = await Period.findCurrentPartnerPeriod();
            let clientPeriod = await Period.findCurrentClientPeriod();

            if (!config || !ngoPeriod || !partnerPeriod || !clientPeriod) {
                throw new NotFoundException('internal_server_error')
            }

            config.minNgoTransfer = dto.minNgoTransfer;
            config.minPersonalPool = dto.minPersonalPool;
            config.userExpirationAfterDays = dto.userExpiration;

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

    private updatePeriod(request: PeriodRequest, type: string, period?: Period) {
        if (period) {
            period.to = request.to;
            period.interval = request.interval;
            return period;
        } else {
            return new Period(moment().subtract(5, 'months'), request.to, request.interval, type)
        }
    }

    private mapToResponse(config: Configuration, ngo: Period, partner: Period, client: Period) {
        let ngoRequest = new PeriodRequest(ngo.to, ngo.interval);
        let partnerRequest = new PeriodRequest(partner.to, partner.interval);
        let clientRequest = new PeriodRequest(client.to, client.interval);
        return new ConfigurationRequest(
            config.minNgoTransfer,
            config.minPersonalPool,
            config.userExpirationAfterDays,
            ngoRequest,
            clientRequest,
            partnerRequest);
    }

}
