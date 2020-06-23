import { Injectable, Logger } from "@nestjs/common";
import { Configuration } from "../entity/configuration.entity";
import { User } from "../entity/user.entity";
import { Status } from "../common/enum/status.enum";
import { RoleType } from "../common/enum/roleType";
import { Account } from "../entity/account.entity";
import { Cron } from "@nestjs/schedule";
import { EntityManager, getConnection } from "typeorm";

const moment = require('moment');

@Injectable()
export class UserAccountExpirationScheduler {

    private readonly logger = new Logger(UserAccountExpirationScheduler.name);

    @Cron('0 0 4 * * *')
    async cronJob() {
        this.logger.log('Users expiration check start');

        await getConnection().transaction(async (entityManager: EntityManager) => {

            const users: User[] = await User.createQueryBuilder('user')
                                            .leftJoinAndSelect('user.account', 'account')
                                            .leftJoinAndSelect('user.card', 'card')
                                            .leftJoinAndSelect('account.role', 'role')
                                            .where('account.status = :status', { status: Status.ACTIVE })
                                            .andWhere('role.value = :role', { role: RoleType.CLIENT })
                                            .getMany();

            this.logger.log(`Found ${ users.length } Users`);

            const config = await Configuration.getMain();

            for (const user of users) {
                let account: Account = user.account;
                let card = user.card;

                if (account && user && config) {
                    const numberOfDays = moment().diff(moment(card.updatedAt), 'days', true);
                    if (Math.ceil(numberOfDays) > config.userExpiration) {
                        account.status = Status.NOT_ACTIVE;
                        await entityManager.save(account);
                    }
                }
            }
        });

        this.logger.log('Users expiration check end');
    }
}
