import {Column, Entity, OneToMany, Unique} from "typeorm";
import {Phone} from "./phone.entity";
import {TadeusEntity} from "./base.entity";
import {ColumnNumericTransformer} from "../../common/util/number-column.transformer";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'PHONE_PREFIX'})
@Unique(['value'])
export class PhonePrefix extends TadeusEntity {
    @Column({name: 'VALUE', transformer: new ColumnNumericTransformer()})
    value: number;

    @Column({name: 'CODE'})
    code: string;

    @Column({name: 'MAX_LENGTH', transformer: new ColumnNumericTransformer()})
    maxLength: number;

    @OneToMany(type => Phone, phone => phone.prefix)
    phone?: Phone[];

    constructor(value: number, code: string, max: number) {
        super();
        this.value = value;
        this.code = code;
        this.maxLength = max
    }
}
