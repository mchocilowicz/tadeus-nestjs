import {Column, Entity} from "typeorm";
import {TadeusEntity} from "./base.entity";
import {NumberColumnTransformer} from "../common/util/number-column.transformer";

@Entity({name: 'SETTINGS'})
export class Configuration extends TadeusEntity {

    @Column({name: 'MIN_NGO_TRANSFER', type: 'decimal', transformer: new NumberColumnTransformer()})
    minNgoTransfer: number = 0;

    @Column({name: 'MIN_PERSONAL_POOL', type: 'decimal', transformer: new NumberColumnTransformer()})
    minPersonalPool: number = 0;

    @Column({name: 'USER_EXPIRATION', transformer: new NumberColumnTransformer()})
    userExpiration: number = 0;

    @Column({name: 'PERSONAL_POOL_FREQUENCY', default: 0, transformer: new NumberColumnTransformer()})
    personalPoolFrequency: number = 0;

    @Column({name: 'DONATION_POOL_FREQUENCY', default: 0, transformer: new NumberColumnTransformer()})
    donationPoolFrequency: number = 0;

    @Column({name: 'USER_CLOSE_INTERVAL', transformer: new NumberColumnTransformer()})
    userCloseInterval: number = 0;

    @Column({name: 'PARTNER_EMAIL_INTERVAL', transformer: new NumberColumnTransformer()})
    partnerEmailInterval: number = 0;

    @Column({name: 'PARTNER_CLOSE_INTERVAL', transformer: new NumberColumnTransformer()})
    partnerCloseInterval: number = 0;

    @Column({name: 'NGO_GENERATE_INTERVAL', transformer: new NumberColumnTransformer()})
    ngoGenerateInterval: number = 0;

    @Column({name: 'NGO_CLOSE_INTERVAL', transformer: new NumberColumnTransformer()})
    ngoCloseInterval: number = 0;

    @Column({name: 'TYPE'})
    type: string = 'MAIN';

    static getMain(): Promise<Configuration | undefined> {
        return this.findOne({type: 'MAIN'});
    }
}
