import {Column, Entity} from "typeorm";
import {TadeusEntity} from "./base.entity";
import {ColumnNumericTransformer} from "../../common/util/number-column.transformer";

@Entity({name: 'SETTINGS'})
export class Configuration extends TadeusEntity {

    @Column({name: 'MIN_NGO_TRANSFER', type: 'decimal', transformer: new ColumnNumericTransformer()})
    minNgoTransfer: number = 0;

    @Column({name: 'MIN_PERSONAL_POOL', type: 'decimal', transformer: new ColumnNumericTransformer()})
    minPersonalPool: number = 0;

    @Column({name: 'USER_EXPIRATION', transformer: new ColumnNumericTransformer()})
    userExpiration: number = 0;

    @Column({name: 'USER_CLOSE_INTERVAL', transformer: new ColumnNumericTransformer()})
    userCloseInterval: number = 0;

    @Column({name: 'PARTNER_EMAIL_INTERVAL', transformer: new ColumnNumericTransformer()})
    partnerEmailInterval: number = 0;

    @Column({name: 'PARTNER_CLOSE_INTERVAL', transformer: new ColumnNumericTransformer()})
    partnerCloseInterval: number = 0;

    @Column({name: 'NGO_GENERATE_INTERVAL', transformer: new ColumnNumericTransformer()})
    ngoGenerateInterval: number = 0;

    @Column({name: 'NGO_CLOSE_INTERVAL', transformer: new ColumnNumericTransformer()})
    ngoCloseInterval: number = 0;

    @Column({name: 'TYPE'})
    type: string = 'MAIN';

    static getMain(): Promise<Configuration | undefined> {
        return this.findOne({type: 'MAIN'});
    }
}
