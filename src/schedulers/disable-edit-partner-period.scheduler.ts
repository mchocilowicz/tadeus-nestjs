import { Cron } from "@nestjs/schedule";
import { EntityManager, getConnection } from "typeorm";
import { Configuration } from "../entity/configuration.entity";
import { PartnerPeriod } from "../entity/partner-period.entity";
import { NgoPeriod } from "../entity/ngo-period.entity";
import { Injectable, Logger } from "@nestjs/common";

const moment = require('moment');

@Injectable()
export class DisableEditPartnerPeriodScheduler {

    private readonly logger = new Logger(DisableEditPartnerPeriodScheduler.name);

    @Cron('0 59 23 * * *')
    async disableEditionInCurrentPeriod() {
        const today = moment().format('YYYY-MM-DD');

        this.logger.log("Closing Partner Period for edition start")

        await getConnection().transaction(async (entityManager: EntityManager) => {
            let config: Configuration | undefined = await Configuration.getMain();
            let period: PartnerPeriod | undefined = await PartnerPeriod.createQueryBuilder('p')
                .where('p.isEditable = true')
                .andWhere("p.isClosed = false")
                .andWhere("p.ngoPeriod is null")
                .andWhere("to_char(p.notEditableAt,'YYYY-MM-DD') = :date", {date: today})
                .getOne();

            if (period && config) {
                this.logger.log("Found Partner period to disable edition " + period.id)
                period.isEditable = false;
                period.isClosed = true;
                period.closedAt = moment();
                await entityManager.save(period);

                let ngoPeriod = await NgoPeriod.findActivePeriod();
                if (!ngoPeriod) {
                    ngoPeriod = new NgoPeriod(moment(), moment().add(config.ngoGenerateInterval + config.ngoCloseInterval, 'days'));
                    await entityManager.save(ngoPeriod);
                }
            }
        })
        this.logger.log("Closing Partner Period for edition end")
    }

}