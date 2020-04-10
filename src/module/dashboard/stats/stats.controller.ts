import {Controller, Get, UseGuards} from "@nestjs/common";
import {RoleEnum} from "../../../common/enum/role.enum";
import {Const} from "../../../common/util/const";
import {User} from "../../../database/entity/user.entity";
import {DonationEnum} from "../../../common/enum/donation.enum";
import {TradingPoint} from "../../../database/entity/trading-point.entity";
import {Donation} from "../../../database/entity/donation.entity";
import {TadeusEntity} from "../../../database/entity/base.entity";
import {VirtualCard} from "../../../database/entity/virtual-card.entity";
import {Transaction} from "../../../database/entity/transaction.entity";
import {groupDatesByComponent} from "../../../common/util/functions";
import {StatsService} from "./stats.service";
import {ApiBearerAuth, ApiHeader} from "@nestjs/swagger";
import {Roles} from "../../../common/decorators/roles.decorator";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";

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

        let years: Array<Transaction[]> = groupDatesByComponent(transactions, 'Y') as Array<Transaction[]>;
        let allweeks = [];
        let allMonths = [];
        for (const year of years) {
            allweeks.push(_.flatten(groupDatesByComponent(year, 'w')));
            allMonths.push(_.flatten(groupDatesByComponent(year, 'M')));
        }

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
                weeks: this.service.getPeriodOverview(allweeks),
                months: this.service.getPeriodOverview(allMonths)
            }
        }
    }

}
