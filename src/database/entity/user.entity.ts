import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {Transaction} from "./transaction.entity";
import {Donation} from "./donation.entity";
import {Account} from "./account.entity";
import {UserDetails} from "./user-details.entity";
import {VirtualCard} from "./virtual-card.entity";
import {Opinion} from "./opinion.entity";
import {Notification} from "./notification.entity";
import {Phone} from "./phone.entity";
import {TadeusEntity} from "./base.entity";
import {UserPayout} from "./user-payment.entity";
import {Correction} from "./correction.entity";
import {RoleEnum} from "../../common/enum/role.enum";

@Entity({schema: 'tds'})
export class User extends TadeusEntity {
    @Column({default: false})
    registered: boolean = false;

    @Column({default: false})
    isAnonymous: boolean = false;

    @ManyToOne(type => UserDetails)
    @JoinColumn()
    details?: UserDetails;

    @OneToOne(type => VirtualCard)
    @JoinColumn()
    card?: VirtualCard;

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

    constructor(account: Account, phone?: Phone) {
        super();
        this.account = account;
        this.phone = phone;
    }

    static findUserByPhoneAndPrefix(phone: number, prefix: number) {
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoinAndSelect('user.details', 'details')
            .leftJoin('user.phone', 'phone')
            .leftJoin('phone.prefix', 'prefix')
            .where('role.value = :name', {name: RoleEnum.CLIENT})
            .andWhere('phone.value = :phone', {phone: phone})
            .andWhere('prefix.value = :prefix', {prefix: prefix})
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
            .getOne();
    }

    static findOneWithistoryData(userId: string) {
        return this.createQueryBuilder("user")
            .leftJoinAndSelect("user.transactions", "transactions")
            .leftJoinAndSelect('transactions.tradingPoint', 'tradingPoint')
            .leftJoinAndSelect('tradingPoint.city', 'city')
            .leftJoinAndSelect('user.payouts', 'payouts')
            .leftJoinAndSelect("user.donations", "donations")
            .leftJoinAndSelect("donations.ngo", 'ngo')
            .where("user.id = :id", {id: userId})
            .getOne();
    }

    static getUserWithClientData(accountId: string) {
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoinAndSelect('user.card', 'card')
            .leftJoinAndSelect('user.details', 'details')
            .leftJoinAndSelect('details.ngo', 'ngo')
            .leftJoinAndSelect('ngo.type', 'type')
            .where(`account.id = :id`, {id: accountId})
            .andWhere(`role.value = :role`, {role: RoleEnum.CLIENT})
            .getOne();
    }

    static getUserByCardCode(code: string) {
        return this.createQueryBuilder('user')
            .leftJoinAndSelect('user.card', 'virtual-card')
            .leftJoinAndSelect('user.details', 'details')
            .leftJoinAndSelect('details.ngo', 'ngo')
            .leftJoinAndSelect('ngo.card', 'physical-card')
            .where('virtual-card.code = :code', {code: code})
            .getOne();
    }
}
