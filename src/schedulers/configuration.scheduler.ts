import {Cron, NestSchedule} from "nest-schedule";
import {Injectable, Logger} from "@nestjs/common";
import {Period} from "../database/entity/period.entity";

const moment = require('moment');

@Injectable()
export class ConfigurationScheduler extends NestSchedule {

    private readonly logger = new Logger(ConfigurationScheduler.name);

    @Cron('* * 6 * * *')
    async cronJob() {
        let ngoPeriod: Period | undefined = await Period.findCurrentNgoPeriod();
        let userPeriod: Period | undefined = await Period.findCurrentClientPeriod();
        let partnerPeriod: Period | undefined = await Period.findCurrentPartnerPeriod();

        let currentDate = moment().format('YYYY-MM-DD');

        if (userPeriod) {
            if (moment(userPeriod.to).format('YYYY-MM-DD') === currentDate) {
                const period = new Period(
                    moment(),
                    moment().add(userPeriod.interval, 'days'),
                    userPeriod.interval,
                    'CLIENT');
                await period.save()
            }
        }

        if (partnerPeriod) {
            if (moment(partnerPeriod.to).format('YYYY-MM-DD') === currentDate) {
                if (userPeriod) {
                    const period = new Period(
                        moment(),
                        moment(userPeriod.to).add(partnerPeriod.interval, 'days'),
                        partnerPeriod.interval,
                        'PARTNER');
                    period.relation = userPeriod;
                    await period.save()
                }
            }
        }

        if (ngoPeriod) {
            if (moment(ngoPeriod.to).format('YYYY-MM-DD') === currentDate) {
                if (partnerPeriod) {
                    const period = new Period(
                        moment(),
                        moment(partnerPeriod.to).add(ngoPeriod.interval, 'days'),
                        ngoPeriod.interval,
                        'NGO');
                    period.relation = partnerPeriod;
                    await period.save()
                }
            }
        }
    }
}
