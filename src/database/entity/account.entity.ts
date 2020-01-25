import {Column, Entity, JoinColumn, ManyToOne} from "typeorm";
import {Role} from "./role.entity";
import {Status} from "../../common/enum/status.enum";
import {TadeusEntity} from "./base.entity";
import {ColumnNumericTransformer} from "../../common/util/number-column.transformer";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'ACCOUNT'})
export class Account extends TadeusEntity {

    @Column({name: 'ID'})
    ID: string;

    @Column({name: 'CODE', nullable: true, transformer: new ColumnNumericTransformer()})
    code?: number;

    @Column({name: 'TOKEN', nullable: true})
    token?: string;

    @Column({name: 'FIREBASE_TOKEN', nullable: true})
    firebaseToken?: string;

    @Column({name: 'STATUS', type: 'text', default: Status.ACTIVE})
    status: Status = Status.ACTIVE;

    @ManyToOne(type => Role, {nullable: false})
    @JoinColumn({name: 'ROLE_SKID'})
    role: Role;

    constructor(id: string, role: Role) {
        super();
        this.ID = id;
        this.role = role;
    }
}
