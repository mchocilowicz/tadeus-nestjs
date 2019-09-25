import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Step } from "../../common/enum/status.enum";
import { TradingPoint } from "./trading-point.entity";
import { Transaction } from "./transaction.entity";
import { User } from "./user.entity";

@Entity()
export class Terminal extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: 'text', nullable: true})
    step: Step = Step.SIGN_IN;

    @ManyToOne(type => TradingPoint)
    @JoinColumn()
    tradingPoint: TradingPoint;

    @OneToMany(type => Transaction, transactions => transactions.user)
    transactions: Transaction[];

    @OneToMany(type => User, user => user.terminal)
    user: User[];
}
