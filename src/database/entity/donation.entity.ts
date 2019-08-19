import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Ngo } from "./ngo.entity";
import { User } from "./user.entity";
import { DonationEnum } from "../../common/enum/donation.enum";

@Entity()
export class Donation extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    ID: string;

    @Column({nullable: true})
    invoiceNumber: string;

    @Column({type: 'text'})
    type: DonationEnum;

    @Column({type: 'decimal'})
    price: number;

    @ManyToOne(type => Ngo, ngo => ngo.donations, {nullable: false})
    ngo: Ngo;

    @ManyToOne(type => User, user => user.donations, {nullable: false})
    user: User;
}
