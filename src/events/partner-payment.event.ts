import {InjectEventEmitter} from "nest-emitter";
import {MyEventEmitter} from "./index.event";
import {Injectable, Logger, OnModuleDestroy, OnModuleInit} from "@nestjs/common";
import {EntityManager, getConnection} from "typeorm";
import {Period} from "../database/entity/period.entity";
import {Transaction} from "../database/entity/transaction.entity";
import {PartnerPayment} from "../database/entity/partner-payment.entity";

const moment = require('moment');

@Injectable()
export class PartnerPaymentEvent implements OnModuleInit, OnModuleDestroy {

    private readonly logger = new Logger(PartnerPaymentEvent.name);

    constructor(@InjectEventEmitter() private readonly emitter: MyEventEmitter) {
    }

    onModuleInit() {
        this.emitter.addListener('periods', async periods => await this.onPeriodsEvent(periods));
    }

    onModuleDestroy(): any {
        this.emitter.removeListener('periods', async () => {
        })
    }

    async onPeriodsEvent(userPeriods: Period[]) {
        this.logger.log('Partners Payments Generation - start');

        await getConnection().transaction(async (entityManager: EntityManager) => {
            let activePartnerPeriod: Period | undefined = await Period.findOne({isClosed: false, type: 'PARTNER'});
            if (!activePartnerPeriod) {
                activePartnerPeriod = new Period(moment(), moment().add(21, 'days'), 21, 'PARTNER');
                activePartnerPeriod = await entityManager.save(activePartnerPeriod)
            }
            for (const period of userPeriods) {
                const transactions = period.transactions?.sort((t1: Transaction, t2: Transaction) => t1.tradingPoint.id === t2.tradingPoint.id ? 0 : -1);

                const payments: PartnerPayment[] = [];
                transactions?.forEach((t: Transaction) => {
                    let payment: PartnerPayment | undefined = payments.find((payment: PartnerPayment) => payment.tradingPoint.id === t.tradingPoint.id);
                    if (payment) {
                        payment.transactionsCount += 1;
                        payment.provisionPrice += t.provision;
                        payment.donationPrice += t.poolValue;
                        payment.price += t.price;
                        payment.sellPrice += t.paymentValue;
                    } else {
                        const ID = t.tradingPoint.ID + "-" + moment().format('YYYYMMDD');
                        payment = new PartnerPayment(ID, t.paymentValue, t.price, t.poolValue, t.provision, 1, t.tradingPoint, period);
                        payment.from = period.from;
                        payment.to = period.to;
                        payments.push(payment);
                    }
                });

                await entityManager.save(payments);
                period.period = activePartnerPeriod;
                await entityManager.save(period);
            }
        });
        this.logger.log('Partners Payments Generation - end');
    }
}
