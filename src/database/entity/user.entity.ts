import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { Transaction } from "./transaction.entity";
import { Donation } from "./donation.entity";
import { Account } from "./account.entity";
import { UserDetails } from "./user-details.entity";
import { Terminal } from "./terminal.entity";
import { VirtualCard } from "./virtual-card.entity";
import { Opinion } from "./opinion.entity";
import { Notification } from "./notification.entity";
import { Phone } from "./phone.entity";
import { TadeusEntity } from "./base.entity";
import { UserPayout } from "./user-payment.entity";

@Entity({schema: 'tds'})
export class User extends TadeusEntity {
    @Column({default: false})
    registered: boolean = false;

    @Column({default: false})
    isAnonymous: boolean = false;

    @ManyToOne(type => Terminal)
    @JoinColumn()
    terminal?: Terminal;

    @ManyToOne(type => UserDetails)
    @JoinColumn()
    details?: UserDetails;

    @OneToOne(type => VirtualCard)
    @JoinColumn()
    card?: VirtualCard;

    @ManyToOne(type => Phone)
    @JoinColumn()
    phone?: Phone;

    @OneToMany(type => Account, account => account.user)
    accounts?: Account[];

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

    constructor(phone?: Phone) {
        super();
        this.phone = phone;
    }
}
