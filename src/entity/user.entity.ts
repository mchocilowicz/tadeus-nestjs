import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {Transaction} from "./transaction.entity";
import {Donation} from "./donation.entity";
import {Account} from "./account.entity";
import {VirtualCard} from "./virtual-card.entity";
import {Opinion} from "./opinion.entity";
import {Phone} from "./phone.entity";
import {TadeusEntity} from "./base.entity";
import {UserPayout} from "./user-payout.entity";
import {RoleEnum} from "../common/enum/role.enum";
import {ColumnNumericTransformer} from "../common/util/number-column.transformer";
import {Ngo} from "./ngo.entity";
import {Status, TransactionStatus} from "../common/enum/status.enum";

const moment = require('moment');

@Entity({name: 'USER'})
export class User extends TadeusEntity {
    @Column({name: 'REGISTERED', default: false})
    registered: boolean = false;

    @Column({name: 'IS_ANONYMOUS', default: false})
    isAnonymous: boolean = false;

    @Column({name: 'XP', default: 0, transformer: new ColumnNumericTransformer()})
    xp: number = 0;

    @Column({name: 'NAME', nullable: true})
    name?: string;

    @Column({name: 'EMAIL', nullable: true})
    email?: string;

    @Column({name: 'LAST_NAME', nullable: true})
    lastName?: string;

    @Column({name: 'ACCOUNT_NUMBER', nullable: true, type: "bigint", transformer: new ColumnNumericTransformer()})
    bankAccount?: number;

    @Column({name: 'COLLECTED_MONEY', type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    collectedMoney: number = 0;

    @Column({name: 'PREVIOUS_NAME', nullable: true})
    prevName?: string;

    @Column({name: 'NGO_SELECTED_AT', nullable: true})
    ngoSelectedAt?: Date;

    @ManyToOne(type => Ngo)
    @JoinColumn({name: 'NGO_SKID'})
    ngo?: Ngo;

    @OneToOne(type => VirtualCard)
    @JoinColumn({name: 'VIRTUAL_CARD_SKID'})
    card: VirtualCard;

    @ManyToOne(type => Phone)
    @JoinColumn({name: 'PHONE_SKID'})
    phone?: Phone;

    @OneToOne(type => Account)
    @JoinColumn({name: 'ACCOUNT_SKID'})
    account: Account;

    @OneToMany(type => Transaction, transactions => transactions.user)
    transactions?: Transaction[];

    @OneToMany(type => Opinion, opinion => opinion.user)
    opinions?: Opinion[];

    @OneToMany(type => Donation, donation => donation.user)
    donations?: Donation[];

    @OneToMany(type => UserPayout, payment => payment.user)
    payouts?: UserPayout[];

    constructor(card: VirtualCard, account: Account, phone?: Phone) {
        super();
        this.account = account;
        this.phone = phone;
        this.card = card;
    }

    static getUserWithClientData(accountId: string) {
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('user.phone', 'phone')
            .leftJoinAndSelect('phone.prefix', 'prefix')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoinAndSelect('user.card', 'card')
            .leftJoinAndSelect('user.ngo', 'ngo')
            .leftJoinAndSelect('ngo.type', 'type')
            .where(`account.id = :id`, {id: accountId})
            .andWhere(`role.value = :role`, {role: RoleEnum.CLIENT})
            .andWhere(`account.status = :status`, {status: Status.ACTIVE})
            .getOne();
    }

    static getUserForTransaction(code: string, prefix: number, phone: number) {
        if (code) {
            return this.getUserForTransactionByCode(code)
        } else {
            return this.getUserForTransactionByPhone(prefix, phone)
        }
    }

    static getUserForTransactionByCode(code: string) {
        return this.createQueryBuilder('user')
            .leftJoin('user.phone', 'phone')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoin('account.role', 'role')
            .leftJoin('phone.prefix', 'prefix')
            .leftJoinAndSelect('user.card', 'virtual-card')
            .leftJoinAndSelect('user.ngo', 'ngo')
            .leftJoinAndSelect('ngo.card', 'physical-card')
            .where('virtual-card.code = :code', {code: code})
            .andWhere('role.value = :role', {role: RoleEnum.CLIENT})
            .andWhere('account.status = :status', {status: Status.ACTIVE})
            .getOne();
    }

    static getUserForTransactionByPhone(prefix: number, phone: number) {
        return this.createQueryBuilder('user')
            .leftJoin('user.phone', 'phone')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoin('account.role', 'role')
            .leftJoin('phone.prefix', 'prefix')
            .leftJoinAndSelect('user.card', 'virtual-card')
            .leftJoinAndSelect('user.ngo', 'ngo')
            .leftJoinAndSelect('ngo.card', 'physical-card')
            .where('role.value = :role', {role: RoleEnum.CLIENT})
            .andWhere('account.status = :status', {status: Status.ACTIVE})
            .andWhere('prefix.value = :prefix', {prefix: prefix})
            .andWhere('phone.value = :phone', {phone: phone})
            .getOne();
    }

    static findTopDetailsSortedByCollectedMoney() {
        return this.createQueryBuilder('user')
            .where(`to_date(cast(user.updatedAt as TEXT),'YYYY-MM-DD') > to_date('${moment().format('YYYY-MM-DD')}','YYYY-MM-DD')`)
            .orderBy('user.xp', 'DESC')
            .getMany();
    }

    static findUserByPhoneAndPrefix(phone: number, prefix: number) {
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoin('user.phone', 'phone')
            .leftJoin('phone.prefix', 'prefix')
            .where('role.value = :name', {name: RoleEnum.CLIENT})
            .andWhere('phone.value = :phone', {phone: phone})
            .andWhere('prefix.value = :prefix', {prefix: prefix})
            .andWhere(`account.status = :status`, {status: Status.ACTIVE})
            .getOne();
    }

    static findUserForVerification(phone: number, prefix: number, code: number) {
        return this.createQueryBuilder('user')
            .leftJoin('user.phone', 'phone')
            .leftJoin('phone.prefix', 'prefix')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .where('role.value = :name', {name: RoleEnum.CLIENT})
            .andWhere('phone.value = :phone', {phone: phone})
            .andWhere('prefix.value = :prefix', {prefix: prefix})
            .andWhere('account.code = :code', {code: code})
            .andWhere(`account.status = :status`, {status: Status.ACTIVE})
            .getOne();
    }

    static findOneWithHistoryData(userId: string) {
        return this.createQueryBuilder("user")
            .leftJoinAndSelect("user.transactions", "transactions")
            .leftJoinAndSelect('transactions.tradingPoint', 'tradingPoint')
            .leftJoinAndSelect('tradingPoint.address', 'address')
            .leftJoinAndSelect('address.city', 'city')
            .leftJoinAndSelect('user.payouts', 'payouts')
            .leftJoinAndSelect("user.donations", "donations")
            .leftJoinAndSelect("donations.ngo", 'ngo')
            .where("user.id = :id", {id: userId})
            .andWhere("transactions.status = :status", {status: TransactionStatus.ACCEPTED})
            .getOne();
    }

    updateCollectedMoney(value: number) {
        this.collectedMoney += Number(value)
    }

    setBasicInformation(name: string, email?: string) {
        this.email = email;
        this.name = name;
        this.xp = 50;
    }

    updateInformation(name: string, lastName: string, email: string, bankAccount: number) {
        if (this.name !== name) {
            this.prevName = this.name;
            this.name = name;
        }
        this.lastName = lastName;
        this.email = email;
        this.bankAccount = bankAccount;
    }
}
