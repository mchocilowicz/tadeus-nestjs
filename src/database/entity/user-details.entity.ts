import {Column, Entity, JoinTable, ManyToOne, OneToMany} from "typeorm";
import {Ngo} from "./ngo.entity";
import {User} from "./user.entity";
import {TadeusEntity} from "./base.entity";
import {ColumnNumericTransformer} from "../../common/util/number-column.transformer";

@Entity({schema: 'tds'})
export class UserDetails extends TadeusEntity {
    @Column({default: 0, transformer: new ColumnNumericTransformer()})
    xp: number = 0;

    @Column({nullable: true})
    name: string;

    @Column({nullable: true})
    email: string;

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

    static findTopDetailsSortedByCollectedMoney(top: number) {
        return this.createQueryBuilder('details')
            .orderBy('details.collectedMoney', 'DESC')
            .take(Math.ceil(top))
            .getMany();
    }

    updateCollectedMoney(value: number) {
        this.collectedMoney += Number(value)
    }
}
