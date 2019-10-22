import { Cron, NestSchedule } from "nest-schedule";
import { Injectable } from "@nestjs/common";
import { Configuration } from "../database/entity/configuration.entity";

const moment = require('moment');

@Injectable()
export class ConfigurationScheduler extends NestSchedule {
    @Cron('0 0 4 ? * * *')
    async cronJob() {
        console.log('executing Configuration Job');
        let config = await Configuration.findOne({type: 'MAIN'});
        if (config) {
            let currentDate = moment().format('YYYY-MM-DD');
            let client = moment(config.currentClientPaymentAt).format('YYYY-MM-DD');
            let partner = moment(config.currentPartnerPaymentAt).format('YYYY-MM-DD');
            let ngo = moment(config.currentNgoPaymentAt).format('YYYY-MM-DD');

            if (currentDate === client) {
                let current = config.currentClientPaymentAt;
                config.oldClientPaymentAt = config.previousClientPaymentAt;
                config.previousClientPaymentAt = current;
                config.currentClientPaymentAt = moment(current).add(config.clientInterval, 'days');
                await config.save()
            }
            if (currentDate === partner) {
                let current = config.currentPartnerPaymentAt;
                config.oldPartnerPaymentAt = config.previousPartnerPaymentAt;
                config.previousPartnerPaymentAt = current;
                config.currentPartnerPaymentAt = moment(config.currentClientPaymentAt).add(config.partnerInterval, 'days');
                await config.save()
            }
            if (currentDate === ngo) {
                let current = config.currentNgoPaymentAt;
                config.oldNgoPaymentAt = config.previousNgoPaymentAt;
                config.previousNgoPaymentAt = current;
                config.currentNgoPaymentAt = moment(config.currentPartnerPaymentAt).add(config.ngoInterval, 'days');
                await config.save()
            }
        }
    }
}
