import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {Role} from "./role.entity";
import {Status} from "../../common/enum/status.enum";
import {TadeusEntity} from "./base.entity";
import {ColumnNumericTransformer} from "../../common/util/number-column.transformer";

@Entity({schema: 'tds'})
export class Account extends TadeusEntity {

    @Column()
    ID: string;

    @Column({nullable: true, transformer: new ColumnNumericTransformer()})
    code?: number;

    @Column({nullable: true})
    token?: string;

    @Column({type: 'text', default: Status.ACTIVE})
    status: Status = Status.ACTIVE;

    @ManyToOne(type => Role, {nullable: false})
    @JoinColumn()
    role: Role;

    constructor(id: string, role: Role) {
        super();
        this.ID = id;
        this.role = role;
    }
}
