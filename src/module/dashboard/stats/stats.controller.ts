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
import { StatsService } from "./stats.service";

const moment = require("moment");
const _ = require('lodash');

@Controller()
export class StatsController {

    constructor(private readonly service: StatsService) {
    }

    @Get('user')
    async getUsersStats() {
        let users: User[] = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .where('role.value = :name', {name: RoleEnum.CLIENT})
            .getMany();

        return {
            activePoints: users.filter((points: User) => points.registered).length,
            ...this.service.getTimeStats(users as TadeusEntity[])
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
            ...this.service.getTimeStats(points)
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

        let transactionsIn24Hours = transactions.filter((t: Transaction) => moment(t.updatedAt).isBetween(moment().format(Const.DATE_FORMAT), moment().subtract(1, 'days').format(Const.DATE_FORMAT)));

        return {
            today: transactionsIn24Hours.reduce((o, e: Transaction) => o + e.price, 0),
            weeks: this.service.getPeriodOverview(allweeks),
            months: this.service.getPeriodOverview(allMonths)
        }
    }

}
