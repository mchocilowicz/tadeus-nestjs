import { Column, Entity, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { TadeusEntity } from "./base.entity";

@Entity({schema: 'tds'})
export class Opinion extends TadeusEntity {
    @Column()
    value: string;

    @Column()
    email: string;

    @ManyToOne(type => User, user => user.opinions)
    user: User;

    constructor(email: string, value: string, user: User) {
        super();
        this.email = email;
        this.value = value;
        this.user = user;
    }
}
