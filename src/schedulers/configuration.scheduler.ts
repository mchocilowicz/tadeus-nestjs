import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { EntityManager, getConnection } from "typeorm";
import { Configuration } from "../entity/configuration.entity";
import { Cron } from "@nestjs/schedule";
import { UserPeriod } from "../entity/user-period.entity";
import { User } from "../entity/user.entity";
import { Donation } from "../entity/donation.entity";
import { CodeService } from "../common/service/code.service";
import { DonationEnum, PoolEnum } from "../common/enum/donation.enum";
import { PartnerPeriod } from "../entity/partner-period.entity";
import { TierService } from "../module/common/tier.service";

const moment = require('moment');

@Injectable()
export class ConfigurationScheduler {

    private readonly logger = new Logger(ConfigurationScheduler.name);

    constructor(private codeService: CodeService) {
    }

    @Cron('* * 3 * * *')
    async createNewUserPeriod() {
        await getConnection().transaction(async (entityManager: EntityManager) => {
            this.logger.log('Opening new User Periods start')

            const config: Configuration | undefined = await Configuration.getMain();

            if (!config) {
                throw new NotFoundException('configuration_not_exists')
            }

            let currentDate = moment().format('YYYY-MM-DD');
            let userPeriods: UserPeriod[] = await UserPeriod.findPeriodsToClose(currentDate);

            this.logger.log(`Found ${userPeriods.length} User Periods to process`)

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

                        TierService.asignTier(donation.price, user, card)

                        await entityManager.save(card);
                        await entityManager.save(donation);
                    }
                }
                await entityManager.save(userPeriod);
            }

            const newPeriod = new UserPeriod(moment(), moment().add(config.userCloseInterval + 1, 'days'));
            await entityManager.save(newPeriod);

            const partnerPeriod = await PartnerPeriod.findActivePeriod();
            if (!partnerPeriod) {
                const newPartnerPeriod = new PartnerPeriod(moment(), moment().add(config.partnerEmailInterval + 1, 'days'));
                await entityManager.save(newPartnerPeriod);
            }

            this.logger.log('Opening new User Periods end')
        });
    }
}
