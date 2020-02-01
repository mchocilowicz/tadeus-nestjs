import {Column, Entity, JoinColumn, ManyToOne, OneToMany} from "typeorm";
import {TradingPoint} from "./trading-point.entity";
import {TadeusEntity} from "./base.entity";
import {Transaction} from "./transaction.entity";
import {ColumnNumericTransformer} from "../../common/util/number-column.transformer";
import {PartnerPeriod} from "./partner-period.entity";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'PARTNER_PAYMENT'})
export class PartnerPayment extends TadeusEntity {
    @Column({name: 'ID'})
    ID: string;

    @Column({name: 'VALID_FROM', nullable: true})
    from?: Date;

    @Column({name: 'VALID_TO', nullable: true})
    to?: Date;

    @Column({name: 'PAYMENT_DETAILS', nullable: true})
    paymentDetails?: string;

    @Column({name: 'IS_PAID', default: false})
    isPaid: boolean = false;

    @Column({name: 'PRICE', type: 'decimal', transformer: new ColumnNumericTransformer()})
    price: number;

    @Column({name: 'PAID_PRICE', type: 'decimal', nullable: true, transformer: new ColumnNumericTransformer()})
    paidPrice: number = 0;

    @Column({name: 'TRANSACTION_COUNT', type: 'decimal', transformer: new ColumnNumericTransformer()})
    transactionsCount: number;

    @Column({name: 'SELL_PRICE', type: 'decimal', transformer: new ColumnNumericTransformer()})
    sellPrice: number;

    @Column({name: 'DONATION_PRICE', type: 'decimal', transformer: new ColumnNumericTransformer()})
    donationPrice: number;

    @Column({name: 'PROVISION_PRICE', type: 'decimal', transformer: new ColumnNumericTransformer()})
    provisionPrice: number;

    @Column({name: 'SEND_MESSAGE_AT', nullable: true})
    sendMessageAt?: Date;

    @Column({name: 'PAYMENT_AT', nullable: true})
    paymentAt?: Date;

    @Column({name: 'PAYED_AT', nullable: true})
    partnerPayedAt?: Date;

    @ManyToOne(type => TradingPoint)
    @JoinColumn({name: 'PARTNER_SKID'})
    tradingPoint: TradingPoint;

    @OneToMany(type => Transaction, transactions => transactions.payment)
    transactions?: Transaction[];

    @ManyToOne(type => PartnerPeriod)
    @JoinColumn({name: 'PARTNER_PERIOD_SKID'})
    partnerPeriod: PartnerPeriod;

    constructor(ID: string, price: number, sellPrice: number, donationPrice: number, provisionPrice: number, transactionsCount: number, tradingPoint: TradingPoint, period: PartnerPeriod) {
        super();
        this.price = price;
        this.ID = ID;
        this.transactionsCount = transactionsCount;
        this.tradingPoint = tradingPoint;
        this.partnerPeriod = period;
        this.sellPrice = sellPrice;
        this.donationPrice = donationPrice;
        this.provisionPrice = provisionPrice;
    }

    static findAllNotPaidPayments(tradingPointId: string): Promise<PartnerPayment[]> {
        return this.createQueryBuilder("p")
            .leftJoinAndSelect("p.tradingPoint", "point")
            .where("p.isPaid = false")
            .andWhere("p.paymentAt is not null")
            .andWhere("point.id = :id", {id: tradingPointId})
            .orderBy("p.createdAt", "DESC")
            .getMany();
    }
}
