import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Place } from "./place.entity";

@Entity()
export class Transaction extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    price: number;

    @Column()
    donation: number;

    @Column()
    recipeCode: string;

    @Column()
    xp: number;

    @Column({type:'date'})
    transactionDay;

    // @Column()
    // user: User;
    //
    // @Column()
    // partner: User;
    //
    // @Column()
    // place: Place;

    @CreateDateColumn()
    createdAt: Date;

}
