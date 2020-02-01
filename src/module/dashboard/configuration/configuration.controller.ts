import {Body, Controller, Get, Post} from "@nestjs/common";
import {Configuration} from "../../../database/entity/configuration.entity";
import {ApiTags} from "@nestjs/swagger";
import {ConfigurationRequest} from "../../../models/dashboard/request/configuration.request";
import {getConnection} from "typeorm";
import {UserPeriod} from "../../../database/entity/user-period.entity";

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
            config.userExpiration = dto.userExpiration;
            config.ngoCloseInterval = dto.ngoCloseInterval;
            config.ngoGenerateInterval = dto.ngoGenerateInterval;
            config.userCloseInterval = dto.userCloseInterval;
            config.partnerEmailInterval = dto.partnerEmailInterval;
            config.partnerCloseInterval = dto.partnerCloseInterval;

            let period: UserPeriod | undefined = await UserPeriod.findActivePeriod();
            if (!period) {
                period = new UserPeriod(moment(), moment().add(dto.userExpiration, 'days'))
                await entityManager.save(period);
            }


            await entityManager.save(config);
            return new ConfigurationRequest(config)
        })
    }

    @Get()
    async getConfiguration() {
        let config = await Configuration.getMain();

        if (config) {
            return new ConfigurationRequest(config)
        }

        return null;
    }
}
