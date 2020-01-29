import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PartnerPayment } from "../database/entity/partner-payment.entity";
import { EmailService } from "../module/common/email.service";
import { EntityManager, getConnection } from "typeorm";

const moment = require('moment');

@Injectable()
export class UserAccountExpirationScheduler {

    constructor(private readonly emailService: EmailService) {
    }

    @Cron(' 0 0 8 ? * * *')
    async sendEmails() {
        let payments = await PartnerPayment.createQueryBuilder("p")
            .leftJoinAndSelect('p.tradingPoint', 'point')
            .where("p.isPaid = false")
            .andWhere(`to_date(cast(p.sendMessageAt as TEXT),'YYYY-MM-DD') = to_date('${ moment().format('YYYY-MM-DD') }','YYYY-MM-DD')`)
            .orderBy('p.createdAt', 'DESC')
            .getMany();

        if (payments) {
            let lst: any[] = [];

            payments.forEach(payment => {
                let obj: any | undefined = lst.find(el => el.id === payment.tradingPoint.id);
                if (obj) {
                    obj.to = payment.to;
                } else {
                    lst.push({
                        id: payment.tradingPoint.id,
                        price: payment.price,
                        donationPrice: payment.donationPrice,
                        sellPrice: payment.sellPrice,
                        email: payment.tradingPoint.email,
                        from: payment.from,
                        to: payment.to
                    });
                }
                payment.paymentAt = moment().add(8, 'days')
            });
            getConnection().transaction(async (entityManager: EntityManager) => {
                await entityManager.save(payments);
                for (const emailData of lst) {
                    await this.emailService.sendEmail(emailData)
                }
            })

        }

    }
}