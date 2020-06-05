import {Injectable, Logger} from "@nestjs/common";
import {Configuration} from "../entity/configuration.entity";
import {User} from "../entity/user.entity";
import {Status} from "../common/enum/status.enum";
import {RoleEnum} from "../common/enum/role.enum";
import {Account} from "../entity/account.entity";
import {Cron} from "@nestjs/schedule";

const moment = require('moment');

@Injectable()
export class UserAccountExpirationScheduler {

    private readonly logger = new Logger(UserAccountExpirationScheduler.name);

    @Cron('0 0 4 * * * *')
    async cronJob() {


        this.logger.log('Users expiration check start');

        const users: User[] = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.accounts', 'account')
            .leftJoinAndSelect('user.details', 'details')
            .leftJoinAndSelect('account.role', 'role')
            .where('account.status = :status', {status: Status.ACTIVE})
            .andWhere('role.value = :role', {role: RoleEnum.CLIENT})
            .getMany();

        this.logger.log(`Found ${users.length} Users`);

        const config = await Configuration.findOne({type: 'MAIN'});

        for (const user of users) {
            let account: Account = user.account;

            if (account && user && config) {
                if (account.role.value === RoleEnum.CLIENT) {
                    const numberOfDays = moment().diff(moment(user.updatedAt), 'days', true);
                    if (Math.ceil(numberOfDays) > config.userExpiration) {
                        account.status = Status.NOT_ACTIVE;
                        await account.save();
                    }
                }
            }
        }
        this.logger.log('Users expiration check start');
    }
}
