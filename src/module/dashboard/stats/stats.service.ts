import { Injectable } from "@nestjs/common";
import { Transaction } from "../../../entity/transaction.entity";
import { TadeusEntity } from "../../../entity/base.entity";
import { Const } from "../../../common/util/const";

const moment = require("moment");

@Injectable()
export class StatsService {
    constructor() {
    }

    getPeriodOverview(list: Array<Transaction[]>) {
        return list.map((value: Transaction[]) => {
            if (value.length === 1) {
                return {
                    period: this.prepareDate(value[0].createdAt),
                    price: value[0].price
                }
            } else {
                return {
                    period: `${ this.prepareDate(value[0].createdAt) } - ${ this.prepareDate(value[value.length - 1].createdAt) }`,
                    price: value.reduce((p: number, v: Transaction) => p + v.price, 0)
                }
            }
        });
    }

    getTimeStats(list?: TadeusEntity[]) {
        let activeToday: TadeusEntity[] = [];
        let activeInWeek: TadeusEntity[] = [];
        let activeInMonth: TadeusEntity[] = [];
        let activeOneMonthAgo: TadeusEntity[] = [];
        let activeMonthsAgo: TadeusEntity[] = [];

        const today = moment()
        const yesterdayDate = moment().subtract(23, 'hour').subtract(59, 'minute');
        const weekAgoDate = moment().subtract(7, 'day').subtract(today.hour(), 'hour').subtract(today.minute(), 'minute');
        const monthAgoDate = moment().subtract(1, 'month').subtract(today.hour(), 'hour').subtract(today.minute(), 'minute');
        const oneMonthAgoDate = moment().subtract(30, 'day');
        const threeMonthAgoDate = moment().subtract(90, 'day');
        const infinity = moment().subtract(1000, 'year');

        if (list) {
            list.forEach((point: TadeusEntity) => {
                const pointLastUpdatteAt = moment(point.updatedAt);

                if (pointLastUpdatteAt.isBetween(yesterdayDate, today)) {
                    activeToday.push(point);
                } else if (pointLastUpdatteAt.isBetween(weekAgoDate, today)) {
                    activeInWeek.push(point);
                } else if (pointLastUpdatteAt.isBetween(monthAgoDate, today)) {
                    activeInMonth.push(point);
                } else if (pointLastUpdatteAt.isBetween(oneMonthAgoDate, infinity)) {
                    activeOneMonthAgo.push(point);
                } else if (pointLastUpdatteAt.isBetween(threeMonthAgoDate, infinity)) {
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

    private prepareDate(date: Date): string {
        return moment(date).format(Const.DATE_FORMAT);
    }
}
