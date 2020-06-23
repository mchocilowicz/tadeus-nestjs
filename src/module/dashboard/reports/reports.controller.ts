import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { Transaction } from "../../../entity/transaction.entity";
import { TransactionStatus } from "../../../common/enum/status.enum";
import { ApiBearerAuth, ApiHeader } from "@nestjs/swagger";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleType } from "../../../common/enum/roleType";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Const } from "../../../common/util/const";
import { roundToTwo } from "../../../common/util/functions";


const moment = require("moment");
const _ = require('lodash');

@Controller() @ApiBearerAuth() @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
export class ReportsController {

    @Get('dates') @Roles(RoleType.DASHBOARD) @UseGuards(JwtAuthGuard, RolesGuard)
    async getReportsDates() {
        const dates = await Transaction.createQueryBuilder('t')
            .select("to_char(t.createdAt,'YYYY-MM')", 'date')
            .groupBy("to_char(t.createdAt,'YYYY-MM')")
            .getRawMany();

        return dates.map(e => e.date);
    }

    @Get() @Roles(RoleType.DASHBOARD) @UseGuards(JwtAuthGuard, RolesGuard)
    async getReports(@Query() query: { date: string }) {
        let date = moment().format('YYYY-MM');

        if (query && query.date) {
            date = query.date
        }

        let transactions = await Transaction.createQueryBuilder('t')
            .leftJoinAndSelect("t.user", "user")
            .leftJoinAndSelect("t.ngo", 'ngo')
            .leftJoinAndSelect("t.tradingPoint", 'point')
            .where("to_char(t.createdAt,'YYYY-MM') = :date", {date: date})
            .andWhere("t.status = :status", {status: TransactionStatus.ACCEPTED})
            .getMany();

        let ngoList = _.uniqBy(transactions.map(elem => {
            let obj = {
                ID: elem['ngo'].ID,
                name: elem['ngo'].name,
                usersCount: 0,
                donations: 0,
                count: 0,
                list: []
            };
            return obj;
        }), "ID");

        let groupedTransactionByNgo = _.groupBy(transactions, (elem: Transaction) => elem['ngo'].ID);
        Object.keys(groupedTransactionByNgo).forEach((value: string) => {
            const foundNgo = ngoList.find((n: any) => n.ID === value);
            if (foundNgo) {
                const transactions: Transaction[] = groupedTransactionByNgo[value];
                foundNgo.usersCount = _.uniq(transactions.map(t => t.user.id)).length;
                foundNgo.donations = roundToTwo(transactions.reduce((previousValue, currentValue) => previousValue + currentValue.ngoDonation, 0));
                foundNgo.count = _.uniq(transactions.map(t => t['tradingPoint'].id)).length;
                const tradingPoints = _.uniqBy(transactions.map(elem => {
                    return {
                        ID: elem['tradingPoint'].ID,
                        name: elem['tradingPoint'].name,
                        count: 0
                    }
                }), 'ID');
                tradingPoints.forEach((point: any) => {
                    point.count = transactions.filter(e => e['tradingPoint'].ID === point.ID).length;
                });
                foundNgo.list = _.take(tradingPoints.sort((a: any, b: any) => {
                    if (a.count > b.count) {
                        return -1;
                    } else if (a.count < b.count) {
                        return 1;
                    } else {
                        return 0
                    }
                }), 3);
            }
        });


        let pointList = _.uniqBy(transactions.map(elem => {
            let obj = {
                ID: elem['tradingPoint'].ID,
                name: elem['tradingPoint'].name,
                usersCount: 0,
                donations: 0,
                count: 0,
                list: []
            };
            return obj;
        }), "ID");

        let groupedTransactionByPoint = _.groupBy(transactions, (elem: Transaction) => elem['tradingPoint'].ID);
        Object.keys(groupedTransactionByPoint).forEach((value: string) => {
            const founPoint = pointList.find((n: any) => n.ID === value);
            if (founPoint) {
                const transactions: Transaction[] = groupedTransactionByPoint[value];
                founPoint.usersCount = _.uniq(transactions.map(t => t.user.id)).length;
                founPoint.donations = roundToTwo(transactions.reduce((previousValue, currentValue) => previousValue + currentValue.ngoDonation, 0));
                founPoint.count = _.uniq(transactions.map(t => t['ngo'].id)).length;
                const ngos = _.uniqBy(transactions.map(elem => {
                    return {
                        ID: elem['ngo'].ID,
                        name: elem['ngo'].name,
                        count: 0
                    }
                }), 'ID');
                ngos.forEach((ngo: any) => {
                    ngo.count = transactions.filter(e => e['ngo'].ID === ngo.ID).length;
                });
                founPoint.list = _.take(ngos.sort((a: any, b: any) => {
                    if (a.count > b.count) {
                        return -1;
                    } else if (a.count < b.count) {
                        return 1;
                    } else {
                        return 0
                    }
                }), 3);
            }
        });


        return {
            ngo: ngoList,
            tradingPoint: pointList
        }
    }

}
