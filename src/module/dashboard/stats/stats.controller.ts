import { Controller, Get, UseGuards } from "@nestjs/common";
import { RoleEnum } from "../../../common/enum/role.enum";
import { Const } from "../../../common/util/const";
import { User } from "../../../entity/user.entity";
import { DonationEnum } from "../../../common/enum/donation.enum";
import { TradingPoint } from "../../../entity/trading-point.entity";
import { Donation } from "../../../entity/donation.entity";
import { TadeusEntity } from "../../../entity/base.entity";
import { VirtualCard } from "../../../entity/virtual-card.entity";
import { Transaction } from "../../../entity/transaction.entity";
import { StatsService } from "./stats.service";
import { ApiBearerAuth, ApiHeader } from "@nestjs/swagger";
import { Roles } from "../../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";

const moment = require("moment");
const _ = require('lodash');

@Controller()
@ApiBearerAuth()
@ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
export class StatsController {

    constructor(private readonly service: StatsService) {
    }

    @Get()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getStats() {
        let users: User[] = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .where('role.value = :name', {name: RoleEnum.CLIENT})
            .getMany();

        let card: VirtualCard[] = await VirtualCard.find();
        let donations: Donation[] = await Donation.find();
        const points: TradingPoint[] = await TradingPoint.find();

        const transactions: Transaction[] = await Transaction.find();

        let {allweeks, allMonths} = this.extractDataForWeeksAndMonths(transactions);

        let transactionsIn24Hours = transactions.filter((t: Transaction) => moment(t.updatedAt).isBetween(moment().format(Const.DATE_FORMAT), moment().subtract(1, 'days').format(Const.DATE_FORMAT)));


        return {
            user: {
                activeUsers: users.filter((points: User) => points.registered).length,
                ...this.service.getTimeStats(users as TadeusEntity[])
            },
            ngo: {
                overall: donations.reduce((o, e: any) => o + e.price, 0),
                personalPool: donations.filter((d: any) => d.pool === 'PERSONAL').reduce((o, e: any) => o + e.price, 0),
                donationPool: donations.filter((d: any) => d.pool === 'DONATION').reduce((o, e: any) => o + e.price, 0),
                ngo: donations.filter((d: any) => d.pool === 'DONATION' && d.type === DonationEnum.NGO).reduce((o, e: any) => o + e.price, 0),
                userPool: card.reduce((o, e: VirtualCard) => o + e.personalPool, 0)
            },
            tradingPoint: {
                activePoints: points.length,
                ...this.service.getTimeStats(points)
            },
            transactions: {
                today: transactionsIn24Hours.reduce((o, e: Transaction) => o + e.price, 0),
                weeks: allweeks,
                months: allMonths
            }
        }
    }

    private extractDataForWeeksAndMonths(transactions: Transaction[]) {
        let years = this.service.groupDates(transactions, 'Y');
        let allweeks: any = [];
        let allMonths: any = [];

        let sortedYear = [...years.keys()].sort((a, b) => a > b ? -1 : 1);

        for (const year of sortedYear) {
            const data = years.get(year);
            if (data) {
                this.extractedDataByFormat(data, allweeks, 'W', 'isoWeek');
                this.extractedDataByFormat(data, allMonths, 'M', 'months');
            }
        }
        return {allweeks, allMonths};
    }

    private extractedDataByFormat(data: TadeusEntity[], allweeks: any[], format: string, format2: string): void {
        let groupedData = this.service.groupDates(data, format);
        let sortedData = [...groupedData.keys()].sort((a, b) => a > b ? -1 : 1);

        sortedData.forEach(value => {
            let period = groupedData.get(value)
            if (period) {
                allweeks.push(this.service.getPeriodOverview(period as Transaction[], format2));
            }
        })
    }
}
