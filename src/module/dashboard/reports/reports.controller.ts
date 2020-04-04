import {Controller, Get, Query} from "@nestjs/common";
import {Transaction} from "../../../database/entity/transaction.entity";
import {TransactionStatus} from "../../../common/enum/status.enum";


const moment = require("moment");
const _ = require('lodash');

@Controller()
export class ReportsController {

    @Get('dates')
    async getReportsDates() {
        return await Transaction.createQueryBuilder('t')
            .select("to_char(t.createdAt,'YYYY-MM')", 'date')
            .groupBy("to_char(t.createdAt,'YYYY-MM')")
            .getRawMany();
    }

    @Get()
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
                ID: elem.ngo.ID,
                name: elem.ngo.name,
                usersCount: 0,
                donations: 0,
                tradingPointsCount: 0,
                tradingPoint: []
            };
            return obj;
        }), "ID");

        let groupedTransactionByNgo = _.groupBy(transactions, (elem: Transaction) => elem.ngo.ID);
        Object.keys(groupedTransactionByNgo).forEach((value: string) => {
            const foundNgo = ngoList.find((n: any) => n.ID === value);
            if (foundNgo) {
                const transactions: Transaction[] = groupedTransactionByNgo[value];
                foundNgo.usersCount = _.uniq(transactions.map(t => t.user.id)).length;
                foundNgo.donations = transactions.reduce((previousValue, currentValue) => previousValue + currentValue.ngoDonation, 0);
                foundNgo.tradingPointsCount = _.uniq(transactions.map(t => t.tradingPoint.id)).length;
                const tradingPoints = _.uniqBy(transactions.map(elem => {
                    return {
                        ID: elem.tradingPoint.ID,
                        name: elem.tradingPoint.name,
                        transactionsCount: 0
                    }
                }), 'ID');
                tradingPoints.forEach((point: any) => {
                    point.transactionsCount = transactions.filter(e => e.tradingPoint.ID === point.ID).length;
                });
                foundNgo.tradingPoint = _.take(tradingPoints.sort((a: any, b: any) => {
                    if (a.transactionsCount > b.transactionsCount) {
                        return -1;
                    } else if (a.transactionsCount < b.transactionsCount) {
                        return 1;
                    } else {
                        return 0
                    }
                }), 3);
            }
        });


        let pointList = _.uniqBy(transactions.map(elem => {
            let obj = {
                ID: elem.tradingPoint.ID,
                name: elem.tradingPoint.name,
                usersCount: 0,
                donations: 0,
                ngoCount: 0,
                ngoList: []
            };
            return obj;
        }), "ID");

        let groupedTransactionByPoint = _.groupBy(transactions, (elem: Transaction) => elem.tradingPoint.ID);
        Object.keys(groupedTransactionByPoint).forEach((value: string) => {
            const founPoint = pointList.find((n: any) => n.ID === value);
            if (founPoint) {
                const transactions: Transaction[] = groupedTransactionByPoint[value];
                founPoint.usersCount = _.uniq(transactions.map(t => t.user.id)).length;
                founPoint.donations = transactions.reduce((previousValue, currentValue) => previousValue + currentValue.ngoDonation, 0);
                founPoint.ngoCount = _.uniq(transactions.map(t => t.ngo.id)).length;
                const ngos = _.uniqBy(transactions.map(elem => {
                    return {
                        ID: elem.ngo.ID,
                        name: elem.ngo.name,
                        transactionsCount: 0
                    }
                }), 'ID');
                ngos.forEach((ngo: any) => {
                    ngo.transactionsCount = transactions.filter(e => e.ngo.ID === ngo.ID).length;
                });
                founPoint.ngoList = _.take(ngos.sort((a: any, b: any) => {
                    if (a.transactionsCount > b.transactionsCount) {
                        return -1;
                    } else if (a.transactionsCount < b.transactionsCount) {
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
