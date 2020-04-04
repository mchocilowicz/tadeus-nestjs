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

        // Indywidualny miesięczny dla NGO’s
        // o Wartość przekazanej donacji
        // o Ilu użytkowników przekazało donację
        // o Z ilu punktów handlowych pochodzą donacje
        // o Trzy najbardziej „zasłużone” punkty handlowe
        let ngoList = transactions.map(elem => {
            let obj = {
                ID: elem.ngo.ID,
                name: elem.ngo.name,
                usersCount: 0,
                donations: 0,
                tradingPointsCount: 0,
                tradingPoint: []
            };
            return obj;
        })
        let groupedTransactionByNgo = _.groupBy(transactions, (elem: Transaction) => elem.ngo.ID);

        // Indywidualny miesięczny dla PUNKTU HANDLOWEGO
        // o Wartość przekazanej donacji
        // o Ilu użytkowników przekazało donację
        // o Do ilu NGO’s trafiły donacje
        // o Trzy najbardziej obdarowane NGO’


        let groupedTransactionByPoint = _.groupBy(transactions, (elem: Transaction) => elem.tradingPoint.ID);


        return "Test";
    }

}
