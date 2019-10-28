import { Controller, Get } from "@nestjs/common";
import { RoleEnum } from "../../../common/enum/role.enum";
import { Const } from "../../../common/util/const";
import { User } from "../../../database/entity/user.entity";
import { DonationEnum } from "../../../common/enum/donation.enum";
import { TradingPoint } from "../../../database/entity/trading-point.entity";
import { Donation } from "../../../database/entity/donation.entity";
import { TadeusEntity } from "../../../database/entity/base.entity";
import { VirtualCard } from "../../../database/entity/virtual-card.entity";
import { Transaction } from "../../../database/entity/transaction.entity";
import { groupDatesByComponent } from "../../../common/util/functions";

const moment = require("moment");
const _ = require('lodash');

@Controller()
export class StatsController {

    @Get('user')
    async getUsersStats() {
        let users: User[] = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.details', 'details')
            .leftJoinAndSelect('user.accounts', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .where('role.value = :name', {name: RoleEnum.CLIENT})
            .getMany();

        let details = users.map((u: User) => u.details) as TadeusEntity[];

        return {
            activePoints: users.filter((points: User) => points.registered).length,
            ...this.getTimeStats(details)
        }
    }

    @Get('ngo')
    async getNgoStats() {
        let donations: Donation[] = await Donation.find();
        let card: VirtualCard[] = await VirtualCard.find();


        return {
            overall: donations.reduce((o, e: any) => o + e.price, 0),
            personalPool: donations.filter((d: any) => d.pool === 'PERSONAL').reduce((o, e: any) => o + e.price, 0),
            donationPool: donations.filter((d: any) => d.pool === 'DONATION').reduce((o, e: any) => o + e.price, 0),
            ngo: donations.filter((d: any) => d.pool === 'DONATION' && d.type === DonationEnum.NGO).reduce((o, e: any) => o + e.price, 0),
            userPool: card.reduce((o, e: VirtualCard) => o + e.personalPool, 0)
        }
    }

    @Get('trading-point')
    async getPointStats() {
        const points: TradingPoint[] = await TradingPoint.find();
        return {
            activePoints: points.length,
            ...this.getTimeStats(points)
        }
    }

    @Get('transaction')
    async getTransactionsStats() {
        const transactions: Transaction[] = await Transaction.find();

        let years: Array<Transaction[]> = groupDatesByComponent(transactions, 'Y') as Array<Transaction[]>;
        let allweeks = [];
        let allMonths = [];
        for (const year of years) {
            allweeks.push(_.flatten(groupDatesByComponent(year, 'w')));
            allMonths.push(_.flatten(groupDatesByComponent(year, 'M')));
        }

        let a = transactions.filter((t: Transaction) => moment(t.updatedAt).isBetween(moment().format(Const.DATE_FORMAT), moment().subtract(1, 'days').format(Const.DATE_FORMAT)));
        let b = a.reduce((o, e: Transaction) => o + e.price, 0)
    }

    getTimeStats(list?: TadeusEntity[]) {
        let activeToday: TadeusEntity[] = [];
        let activeInWeek: TadeusEntity[] = [];
        let activeInMonth: TadeusEntity[] = [];
        let activeOneMonthAgo: TadeusEntity[] = [];
        let activeMonthsAgo: TadeusEntity[] = [];

        const todayDate = moment().format(Const.DATE_FORMAT);
        const weekAgoDate = moment().subtract(7, 'days').format(Const.DATE_FORMAT);
        const monthAgoDate = moment().subtract(1, 'months').format(Const.DATE_FORMAT);

        if (list) {
            list.forEach((point: TadeusEntity) => {
                const pointLastUpdatteAt = moment(point.updatedAt);

                if (pointLastUpdatteAt.format(Const.DATE_FORMAT) === todayDate) {
                    activeToday.push(point);
                } else if (pointLastUpdatteAt.isBetween(todayDate, weekAgoDate)) {
                    activeInWeek.push(point);
                } else if (pointLastUpdatteAt.isBetween(todayDate, monthAgoDate)) {
                    activeInMonth.push(point);
                } else if (pointLastUpdatteAt.isBetween(moment().subtract(1, 'months').format(Const.DATE_FORMAT), moment().subtract(2, 'months').format(Const.DATE_FORMAT))) {
                    activeOneMonthAgo.push(point);
                } else if (pointLastUpdatteAt.isBetween(moment().subtract(3, 'months').format(Const.DATE_FORMAT), moment().subtract(100, 'years').format(Const.DATE_FORMAT))) {
                    activeMonthsAgo.push(point);
                }
            });
        }

        return {
            today: activeToday.length,
            week: activeInWeek.length,
            month: activeInMonth.length,
            overMonth: activeOneMonthAgo.length,
            months: activeMonthsAgo.length
        }
    }

}
