import {Body, Controller, Get, Post} from "@nestjs/common";
import {Configuration} from "../../../database/entity/configuration.entity";
import {ApiTags} from "@nestjs/swagger";
import {ConfigurationRequest} from "../../../models/dashboard/request/configuration.request";
import {getConnection} from "typeorm";
import {UserPeriod} from "../../../database/entity/user-period.entity";
import {PartnerPeriod} from "../../../database/entity/partner-period.entity";
import {NgoPeriod} from "../../../database/entity/ngo-period.entity";
import {ConfigurationSaveRequest} from "../../../models/dashboard/request/configuration-save.request";

const moment = require('moment');

@Controller()
@ApiTags('configuration')
export class ConfigurationController {

    @Post()
    async save(@Body() dto: ConfigurationSaveRequest) {
        return await getConnection().transaction(async entityManager => {
            let config = await Configuration.getMain();
            if (!config) {
                config = new Configuration();
            }

            config.minNgoTransfer = dto.minNgoTransfer;
            config.minPersonalPool = dto.minPersonalPool;
            config.userExpiration = dto.userExpiration;
            config.ngoCloseInterval = dto.ngoCloseInterval;
            config.ngoGenerateInterval = dto.ngoGenerateInterval;
            config.userCloseInterval = dto.userCloseInterval;
            config.partnerEmailInterval = dto.partnerEmailInterval;
            config.partnerCloseInterval = dto.partnerCloseInterval;

            let period: UserPeriod | undefined = await UserPeriod.findActivePeriod();
            if (!period) {
                period = new UserPeriod(moment(), moment().add(dto.userCloseInterval + 1, 'days'));
                await entityManager.save(period);
            } else {
                period.to = moment(period.from).add(dto.userCloseInterval + 1, 'days');
                await entityManager.save(period);
            }

            let ngo: NgoPeriod | undefined = await NgoPeriod.findActivePeriod();
            if (ngo) {
                ngo.to = moment(ngo.from).add(config.ngoCloseInterval, 'days');
                await entityManager.save(period);
            }

            let partner: PartnerPeriod | undefined = await PartnerPeriod.findActivePeriod();
            if (partner) {
                const sum = config.ngoGenerateInterval + config.partnerCloseInterval + config.partnerEmailInterval;
                partner.to = moment(partner.from).add(sum, 'days');
                await entityManager.save(partner);
            }

            await entityManager.save(config);
        })
    }

    @Get()
    async getConfiguration() {
        let config = await Configuration.getMain();
        let userPeriod = await UserPeriod.findActivePeriod();
        let partnerPeriod = await PartnerPeriod.findActivePeriod();
        let ngoPeriod = await NgoPeriod.findActivePeriod();
        if (config) {
            return new ConfigurationRequest(config, userPeriod, partnerPeriod, ngoPeriod)
        }

        return null;
    }
}
