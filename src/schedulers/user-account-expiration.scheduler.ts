import {Injectable} from "@nestjs/common";
import {Configuration} from "../database/entity/configuration.entity";
import {User} from "../database/entity/user.entity";
import {Status} from "../common/enum/status.enum";
import {RoleEnum} from "../common/enum/role.enum";
import {Account} from "../database/entity/account.entity";
import {Cron} from "@nestjs/schedule";

const moment = require('moment');

@Injectable()
export class UserAccountExpirationScheduler {
    @Cron('0 0 4 * * * *')
    async cronJob() {
        console.log('executing UserAccountExpirationScheduler Job');

        const users: User[] = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.accounts', 'account')
            .leftJoinAndSelect('user.details', 'details')
            .leftJoinAndSelect('account.role', 'role')
            .where('account.status = :status', {status: Status.ACTIVE})
            .andWhere('role.value = :role', {role: RoleEnum.CLIENT})
            .getMany();

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
    }
}
