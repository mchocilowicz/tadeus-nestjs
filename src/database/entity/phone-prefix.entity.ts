import { Column, Entity, OneToMany, Unique } from "typeorm";
import { Phone } from "./phone.entity";
import { TadeusEntity } from "./base.entity";

@Entity({schema: 'tds'})
@Unique(['value'])
export class PhonePrefix extends TadeusEntity {
    @Column()
    value: string;

    @Column()
    code: string;

    @Column()
    maxLength: number;

    @OneToMany(type => Phone, phone => phone.prefix)
    phone?: Phone[];

    constructor(value: string, code: string, max: number) {
        super();
        this.value = value;
        this.code = code;
        this.maxLength = max
    }
}
