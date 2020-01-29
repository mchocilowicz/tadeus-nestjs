import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Period } from "../database/entity/period.entity";
import { EntityManager, getConnection } from "typeorm";
import { Configuration } from "../database/entity/configuration.entity";
import { Const } from "../common/util/const";
import { Cron } from "@nestjs/schedule";

const moment = require('moment');

@Injectable()
export class ConfigurationScheduler {

    private readonly logger = new Logger(ConfigurationScheduler.name);

    @Cron('0 0 3 ? * * *')
    async createNewUserPeriod() {
        const config: Configuration | undefined = await Configuration.getMain();
        let userPeriod: Period | undefined = await Period.findCurrentClientPeriod();
        let currentDate = moment().format('YYYY-MM-DD');

        if (!config) {
            throw new NotFoundException('configuration_not_exists')
        }

        await getConnection().transaction(async (entityManager: EntityManager) => {
            let period = new Period(moment(), moment().add(config.userPeriodInterval, 'days'), config.userPeriodInterval, 'CLIENT');
            if (userPeriod) {
                const newPeriod = moment(userPeriod.from).add(config.userPeriodInterval, 'days').format(Const.DATE_FORMAT);
                if (newPeriod === currentDate) {
                    await entityManager.save(period);
                }
            } else {
                await entityManager.save(period);
            }
        });
    }

    @Cron('0 59 23 ? * * *')
    async closePartnerPeriod() {
        const config: Configuration | undefined = await Configuration.getMain();
        let partnerPeriod: Period | undefined = await Period.createQueryBuilder('p')
            .where("p.type = 'PARTNER'")
            .andWhere("p.isClosed = false")
            .andWhere("p.messagesSendAt is not null")
            .getOne();
        let userPeriod: Period | undefined = await Period.findCurrentClientPeriod();
        let currentDate = moment().format('YYYY-MM-DD');

        if (!config) {
            throw new NotFoundException('configuration_not_exists')
        }

        await getConnection().transaction(async (entityManager: EntityManager) => {
            if (userPeriod && partnerPeriod && currentDate === moment(partnerPeriod.messagesSendAt).add(21, 'days').format(Const.DATE_FORMAT)) {
                partnerPeriod.isClosed = true;
                await entityManager.save(partnerPeriod);
            }
        });
    }
}
