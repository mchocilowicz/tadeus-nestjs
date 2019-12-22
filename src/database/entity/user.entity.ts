import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { Transaction } from "./transaction.entity";
import { Donation } from "./donation.entity";
import { Account } from "./account.entity";
import { VirtualCard } from "./virtual-card.entity";
import { Opinion } from "./opinion.entity";
import { Notification } from "./notification.entity";
import { Phone } from "./phone.entity";
import { TadeusEntity } from "./base.entity";
import { UserPayout } from "./user-payment.entity";
import { Correction } from "./correction.entity";
import { RoleEnum } from "../../common/enum/role.enum";
import { ColumnNumericTransformer } from "../../common/util/number-column.transformer";
import { Ngo } from "./ngo.entity";
import { Status } from "../../common/enum/status.enum";

@Entity({schema: 'tds'})
export class User extends TadeusEntity {
    @Column({default: false})
    registered: boolean = false;

    @Column({default: false})
    isAnonymous: boolean = false;

    @Column({default: 0, transformer: new ColumnNumericTransformer()})
    xp: number = 0;

    @Column({nullable: true})
    name?: string;

    @Column({nullable: true})
    email?: string;

    @Column({nullable: true})
    lastName?: string;

    @Column({nullable: true, transformer: new ColumnNumericTransformer()})
    bankAccount?: number;

    @Column({type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    collectedMoney: number = 0;

    @Column({type: 'decimal', default: 0, transformer: new ColumnNumericTransformer()})
    ngoTempMoney: number = 0;

    @Column({default: 0, transformer: new ColumnNumericTransformer()})
    ngoSelectionCount: number = 0;

    @Column({nullable: true})
    prevName?: string;

    @ManyToOne(type => Ngo)
    @JoinTable()
    ngo?: Ngo;

    @OneToOne(type => VirtualCard)
    @JoinColumn()
    card: VirtualCard;

    @ManyToOne(type => Phone)
    @JoinColumn()
    phone?: Phone;

    @OneToOne(type => Account)
    @JoinColumn()
    account: Account;

    @OneToMany(type => Transaction, transactions => transactions.user)
    transactions?: Transaction[];

    @OneToMany(type => Opinion, opinion => opinion.user)
    opinions?: Opinion[];

    @OneToMany(type => Notification, notification => notification.user)
    notifications?: Notification[];

    @OneToMany(type => Donation, donation => donation.user)
    donations?: Donation[];

    @OneToMany(type => UserPayout, payment => payment.user)
    payouts?: UserPayout[];

    @OneToMany(type => Correction, correction => correction.user)
    corrections?: Correction[];

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
        return this.createQueryBuilder('user')
            .leftJoin('user.phone', 'phone')
            .leftJoin('user.account', 'account')
            .leftJoin('account.role', 'role')
            .leftJoin('phone.prefix', 'prefix')
            .leftJoinAndSelect('user.card', 'virtual-card')
            .leftJoinAndSelect('user.ngo', 'ngo')
            .leftJoinAndSelect('ngo.card', 'physical-card')
            .where('virtual-card.code = :code', {code: code})
            .andWhere('role.value = :role', {role: RoleEnum.CLIENT})
            .andWhere('account.status = :status', {status: Status.ACTIVE})
            .orWhere('prefix.value = :prefix', {prefix: prefix})
            .orWhere('phone.value = :phone', {phone: phone})
            .getOne();
    }

    static findTopDetailsSortedByCollectedMoney(top: number) {
        return this.createQueryBuilder('user')
            .orderBy('user.collectedMoney', 'DESC')
            .take(Math.ceil(top))
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
            .getOne();
    }

    updateCollectedMoney(value: number) {
        this.collectedMoney += Number(value)
    }

    setBasicInformation(name: string, email: string) {
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
