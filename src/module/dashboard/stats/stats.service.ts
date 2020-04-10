import {Injectable} from "@nestjs/common";
import {Transaction} from "../../../database/entity/transaction.entity";
import {TadeusEntity} from "../../../database/entity/base.entity";
import {Const} from "../../../common/util/const";

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
                    period: `${this.prepareDate(value[0].createdAt)} - ${this.prepareDate(value[value.length - 1].createdAt)}`,
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

        const yesterdayDate = moment().subtract(1,'days');
        const weekAgoDate = moment().subtract(7, 'days');
        const monthAgoDate = moment().subtract(1, 'months');

        if (list) {
            list.forEach((point: TadeusEntity) => {
                const pointLastUpdatteAt = moment(point.updatedAt);

                if (pointLastUpdatteAt.isBetween(yesterdayDate, moment())) {
                    activeToday.push(point);
                } else if (pointLastUpdatteAt.isBetween(weekAgoDate, moment())) {
                    activeInWeek.push(point);
                } else if (pointLastUpdatteAt.isBetween(monthAgoDate, moment())) {
                    activeInMonth.push(point);
                } else if (pointLastUpdatteAt.isBetween(monthAgoDate.subtract(1,'months'), monthAgoDate)) {
                    activeOneMonthAgo.push(point);
                } else if (pointLastUpdatteAt.isBetween(monthAgoDate.subtract(2, 'months'), moment().subtract(100, 'years'))) {
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
