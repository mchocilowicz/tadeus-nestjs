import { Column, Entity, JoinTable, ManyToOne, OneToMany } from "typeorm";
import { Ngo } from "./ngo.entity";
import { User } from "./user.entity";
import { TadeusEntity } from "./base.entity";

@Entity({schema: 'tds'})
export class UserDetails extends TadeusEntity {
    @Column({default: 0})
    xp: number = 0;

    @Column({nullable: true})
    name: string;

    @Column({nullable: true})
    email: string;

    @Column({nullable: true})
    lastName?: string;

    @Column({nullable: true})
    bankAccount?: number;

    @Column({type: 'decimal', default: 0})
    collectedMoney: number = 0;

    @Column({type: 'decimal', default: 0})
    ngoTempMoney: number = 0;

    @Column({default: 0})
    ngoSelectionCount: number = 0;

    @OneToMany(type => User, user => user.details)
    user?: User[];

    @ManyToOne(type => Ngo)
    @JoinTable()
    ngo?: Ngo;

    constructor(name: string, email: string, xp: number) {
        super();
        this.name = name;
        this.email = email;
        this.xp = xp;
    }
}
