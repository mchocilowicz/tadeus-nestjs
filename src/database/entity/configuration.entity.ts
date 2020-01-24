import { Column, Entity } from "typeorm";
import { TadeusEntity } from "./base.entity";
import { ColumnNumericTransformer } from "../../common/util/number-column.transformer";

@Entity({schema: process.env.TDS_DATABASE_SCHEMA, name: 'SETTINGS'})
export class Configuration extends TadeusEntity {

    @Column({type: 'decimal', transformer: new ColumnNumericTransformer()})
    minNgoTransfer: number = 0;

    @Column({type: 'decimal', transformer: new ColumnNumericTransformer()})
    minPersonalPool: number = 0;

    @Column({transformer: new ColumnNumericTransformer()})
    userExpirationAfterDays: number = 365;

    @Column()
    type: string = 'MAIN';

    static getMain(): Promise<Configuration | undefined> {
        return this.findOne({type: 'MAIN'});
    }
}
