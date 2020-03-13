import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PartnerPayment } from "../database/entity/partner-payment.entity";
import { EmailService } from "../module/common/email.service";
import { EntityManager, getConnection } from "typeorm";
import { roundToTwo } from "../common/util/functions";
import { PartnerPeriod } from "../database/entity/partner-period.entity";
import { Configuration } from "../database/entity/configuration.entity";
import { NgoPeriod } from "../database/entity/ngo-period.entity";

const moment = require('moment');

@Injectable()
export class SendEmailsToPartnersScheduler {

    constructor(private readonly emailService: EmailService) {
    }

    @Cron('0 15 20 * * *')
    async disableEditionInCurrentPeriod() {
        const today = moment().format('YYYY-MM-DD');

        getConnection().transaction(async (entityManager: EntityManager) => {
            let config: Configuration | undefined = await Configuration.getMain();
            let period: PartnerPeriod | undefined = await PartnerPeriod.createQueryBuilder('p')
                .where('p.isEditable = true')
                .andWhere("p.isClosed = false")
                .andWhere("p.ngoPeriod is null")
                .andWhere("to_char(p.notEditableAt,'YYYY-MM-DD') = :date", {date: today})
                .getOne();

            if (period && config) {
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
    }

    @Cron('0 15 20 * * *')
    async sendEmails() {
        const today = moment().format('YYYY-MM-DD');
        let period: PartnerPeriod | undefined = await PartnerPeriod.findActivePeriod();
        let config: Configuration | undefined = await Configuration.getMain();

        let payments = await PartnerPayment.createQueryBuilder("p")
            .leftJoinAndSelect('p.tradingPoint', 'point')
            .where("p.isPaid = false")
            .andWhere(`to_char(p.sendMessageAt,'YYYY-MM-DD') = :date`, {date: today})
            .orderBy('p.createdAt', 'DESC')
            .getMany();


        if (payments && period && config) {
            let lst: any[] = [];
            let limit = moment().add(8, 'days');
            period.sendMessagesAt = limit;
            period.notEditableAt = moment().add(config.partnerCloseInterval, 'days');
            period.isEditable = true;
            payments.forEach(payment => {
                let obj: any | undefined = lst.find(el => el.id === payment.tradingPoint.id);
                if (obj) {
                    obj.to = payment.to;
                    obj.sellPrice += payment.sellPrice;
                    obj.donationPrice += roundToTwo(payment.donationPrice);
                    obj.price += payment.price - payment.paidPrice;
                } else {
                    let p = payment.price - payment.paidPrice;
                    lst.push({
                        id: payment.tradingPoint.id,
                        donationPrice: roundToTwo(payment.donationPrice),
                        sellPrice: payment.sellPrice,
                        price: p > 0 ? p : 0,
                        email: payment.tradingPoint.email,
                        from: moment(payment.from).format('DD-MM-YYYY'),
                        to: moment(payment.to).format('DD-MM-YYYY'),
                        limit: limit.format('DD-MM-YYYY')
                    });
                }
                payment.paymentAt = limit;
            });
            getConnection().transaction(async (entityManager: EntityManager) => {
                await entityManager.save(payments);
                await entityManager.save(period);

                for (const emailData of lst) {
                    try {
                        await this.emailService.sendEmail(emailData)
                    } catch (e) {
                        console.log(e)
                    }
                }
            })

        }

    }
}
