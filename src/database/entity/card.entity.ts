import { BaseEntity, Column, Entity, Generated, PrimaryGeneratedColumn } from "typeorm";
import { CardEnum } from '../../common/enum/card.enum';

@Entity()
export class Card extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    ID: string;

    @Column({type: 'text'})
    type: CardEnum;

    @Column()
    @Generated("uuid")
    code: string;
}
