import {Controller, Get, Param} from "@nestjs/common";
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

    @Get(':date')
    async getReports(@Param('date') date: string) {
        if (!date) {
            date = moment().format('YYYY-MM');
        }

        let transactions = await Transaction.createQueryBuilder('t')
            .leftJoinAndSelect("t.user", "user")
            .leftJoinAndSelect("t.ngo", 'ngo')
            .leftJoinAndSelect("t.tradingPoint", 'point')
            .where("to_char(t.createdAt,'YYYY-MM') = :date", {date: date})
            .andWhere("t.status = :status", {status: TransactionStatus.ACCEPTED})
            .getMany();

        return "Test";
    }

}
