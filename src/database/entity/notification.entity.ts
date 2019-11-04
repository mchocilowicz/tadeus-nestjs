import {Column, Entity, ManyToOne} from "typeorm";
import {User} from "./user.entity";
import {TadeusEntity} from "./base.entity";


@Entity({schema: 'tds'})
export class Notification extends TadeusEntity {
    @Column()
    transactionId: string;

    @Column()
    message: string;

    @ManyToOne(type => User, user => user.notifications)
    user: User;

    constructor(message: string, user: User, id: string) {
        super();
        this.transactionId = id;
        this.user = user;
        this.message = message;
    }
}
