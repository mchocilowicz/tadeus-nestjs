import { Column, Entity, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { ApiModelProperty } from "@nestjs/swagger";
import { TadeusEntity } from "./base.entity";


@Entity({schema: 'tds'})
export class Notification extends TadeusEntity {
    @ManyToOne(type => User, user => user.notifications)
    user: User;

    @Column()
    @ApiModelProperty()
    value: string;

    constructor(value: string, user: User) {
        super();
        this.value = value;
        this.user = user;
    }
}
