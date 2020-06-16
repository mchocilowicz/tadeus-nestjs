import { Injectable } from "@nestjs/common";
import { Transaction } from "../../../entity/transaction.entity";
import { TadeusEntity } from "../../../entity/base.entity";
import { Const } from "../../../common/util/const";

const moment = require("moment");

@Injectable()
export class StatsService {

    getPeriodOverview(list: Transaction[], format: string) {
        return {
            period: this.prepareDate(list[0].createdAt, format),
            price: list.reduce((p: number, v: Transaction) => p + v.price, 0)
        }
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
                const lastUpdateAt = moment(point.updatedAt);

                if (lastUpdateAt.isBetween(yesterdayDate, today)) {
                    activeToday.push(point);
                } else if (lastUpdateAt.isBetween(weekAgoDate, today)) {
                    activeInWeek.push(point);
                } else if (lastUpdateAt.isBetween(monthAgoDate, today)) {
                    activeInMonth.push(point);
                } else if (lastUpdateAt.isBetween(oneMonthAgoDate, infinity)) {
                    activeOneMonthAgo.push(point);
                } else if (lastUpdateAt.isBetween(threeMonthAgoDate, infinity)) {
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

    groupDates(data: TadeusEntity[], token: string): Map<string, TadeusEntity[]> {
        const groupedMap = data.reduce(function (val: Map<string, TadeusEntity[]>, obj: TadeusEntity) {
            let comp = moment(obj.createdAt).format(token);
            const value = val.get(comp);
            if (value) {
                value.push(obj);
            } else {
                val.set(comp, [obj])
            }
            return val;
        }, new Map<string, []>());
        return groupedMap;
    }

    private prepareDate(date: Date, format: string): string {
        return `${ moment(date).startOf(format).format(Const.DATE_FORMAT) } - ${ moment(date).endOf(format).format(Const.DATE_FORMAT) }`;
    }
}
