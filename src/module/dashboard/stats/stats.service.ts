import { Injectable } from "@nestjs/common";
import { Transaction } from "../../../database/entity/transaction.entity";
import { TadeusEntity } from "../../../database/entity/base.entity";
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
                    period: value[0].createdAt,
                    price: value[0].price
                }
            } else {
                return {
                    period: `${value[0].createdAt} - ${value[value.length - 1].createdAt}`,
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
