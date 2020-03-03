import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { EntityManager, getConnection } from "typeorm";
import { Configuration } from "../database/entity/configuration.entity";
import { Cron } from "@nestjs/schedule";
import { UserPeriod } from "../database/entity/user-period.entity";
import { User } from "../database/entity/user.entity";
import { Donation } from "../database/entity/donation.entity";
import { CodeService } from "../common/service/code.service";
import { DonationEnum, PoolEnum } from "../common/enum/donation.enum";

const moment = require('moment');

@Injectable()
export class ConfigurationScheduler {

    private readonly logger = new Logger(ConfigurationScheduler.name);

    constructor(private codeService: CodeService) {
    }

    @Cron('45 * * * * *')
    async createNewUserPeriod() {
        await getConnection().transaction(async (entityManager: EntityManager) => {
            const config: Configuration | undefined = await Configuration.getMain();

            if (!config) {
                throw new NotFoundException('configuration_not_exists')
            }

            let currentDate = moment().format('YYYY-MM-DD');
            let userPeriods: UserPeriod[] = await UserPeriod.findPeriodsToClose(currentDate);

            if (userPeriods.length === 0) {
                return;
            }

            for (const userPeriod of userPeriods) {
                userPeriod.isClosed = true;

                let users: User[] = await User.createQueryBuilder('u')
                    .leftJoinAndSelect("u.ngo", 'ngo')
                    .leftJoinAndSelect("u.card", 'card')
                    .leftJoin("u.transactions", 'transaction')
                    .leftJoin("transaction.userPeriod", 'period')
                    .where("period.id = :id", {id: userPeriod.id})
                    .getMany();

                for (const user of users) {
                    if (user.ngo) {
                        let ID = this.codeService.generateDonationID();
                        let donation = new Donation(
                            ID,
                            DonationEnum.NGO,
                            PoolEnum.DONATION,
                            user,
                            userPeriod,
                            user.ngo
                        );

                        let card = user.card;
                        donation.price = card.donationPool;
                        card.donationPool = 0;

                        await entityManager.save(card);
                        await entityManager.save(donation);
                    }
                }
                await entityManager.save(userPeriod);
            }

            const newPeriod = new UserPeriod(moment(), moment().add(config.userCloseInterval + 1, 'days'));
            await entityManager.save(newPeriod);
        });
    }

    // @Cron('0 59 23 ? * * *')
    // async closePartnerPeriod() {
    //     const config: Configuration | undefined = await Configuration.getMain();
    //     let partnerPeriod: PartnerPeriod | undefined = await PartnerPeriod.createQueryBuilder('p')
    //         .where("p.isClosed = false")
    //         .andWhere("p.messagesSendAt is not null")
    //         .andWhere("p.ngoPeriod is null")
    //         .getOne();
    //
    //     let currentDate = moment().format('YYYY-MM-DD');
    //
    //     if (!config) {
    //         throw new NotFoundException('configuration_not_exists')
    //     }
    //
    //     await getConnection().transaction(async (entityManager: EntityManager) => {
    //         if (partnerPeriod && partnerPeriod.sendMessagesAt) {
    //             const date = moment(partnerPeriod.sendMessagesAt).add(config.partnerCloseInterval, 'days').format(Const.DATE_FORMAT);
    //             if (currentDate === date) {
    //                 partnerPeriod.isEditable = false;
    //                 await entityManager.save(partnerPeriod);
    //             }
    //         }
    //     });
    // }
}
