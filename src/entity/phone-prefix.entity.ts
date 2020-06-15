import { Column, Entity, OneToMany, Unique } from "typeorm";
import { Phone } from "./phone.entity";
import { TadeusEntity } from "./base.entity";
import { NumberColumnTransformer } from "../common/util/number-column.transformer";

@Entity({name: 'PHONE_PREFIX'})
@Unique(['value'])
export class PhonePrefix extends TadeusEntity {
    @Column({name: 'VALUE', transformer: new NumberColumnTransformer()})
    value: number;

    @Column({name: 'CODE'})
    code: string;

    @Column({name: 'MAX_LENGTH', transformer: new NumberColumnTransformer()})
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
