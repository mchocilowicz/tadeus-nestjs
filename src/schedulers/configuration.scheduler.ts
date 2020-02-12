import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { EntityManager, getConnection } from "typeorm";
import { Configuration } from "../database/entity/configuration.entity";
import { Const } from "../common/util/const";
import { Cron } from "@nestjs/schedule";
import { UserPeriod } from "../database/entity/user-period.entity";
import { User } from "../database/entity/user.entity";
import { Donation } from "../database/entity/donation.entity";
import { CodeService } from "../common/service/code.service";
import { DonationEnum, PoolEnum } from "../common/enum/donation.enum";
import { PartnerPeriod } from "../database/entity/partner-period.entity";

const moment = require('moment');

@Injectable()
export class ConfigurationScheduler {

    private readonly logger = new Logger(ConfigurationScheduler.name);

    constructor(private codeService: CodeService) {
    }

    @Cron('0 0 3 ? * * *')
    async createNewUserPeriod() {
        const config: Configuration | undefined = await Configuration.getMain();
        let userPeriod: UserPeriod | undefined = await UserPeriod.findActivePeriod();
        let currentDate = moment().format('YYYY-MM-DD');

        if (!config) {
            throw new NotFoundException('configuration_not_exists')
        }

        await getConnection().transaction(async (entityManager: EntityManager) => {
            let period = new UserPeriod(moment(), moment().add(config.userCloseInterval, 'days'));
            if (userPeriod) {
                const newPeriod = moment(userPeriod.from).add(config.userCloseInterval, 'days').format(Const.DATE_FORMAT);
                if (newPeriod === currentDate) {
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
        let partnerPeriod: PartnerPeriod | undefined = await PartnerPeriod.createQueryBuilder('p')
            .where("p.isClosed = false")
            .andWhere("p.messagesSendAt is not null")
            .andWhere("p.ngoPeriod is null")
            .getOne();

        let currentDate = moment().format('YYYY-MM-DD');

        if (!config) {
            throw new NotFoundException('configuration_not_exists')
        }

        await getConnection().transaction(async (entityManager: EntityManager) => {
            if (partnerPeriod && partnerPeriod.sendMessagesAt) {
                const date = moment(partnerPeriod.sendMessagesAt).add(config.partnerCloseInterval, 'days').format(Const.DATE_FORMAT);
                if (currentDate === date) {
                    partnerPeriod.isEditable = false;
                    await entityManager.save(partnerPeriod);
                }
            }
        });
    }
}
