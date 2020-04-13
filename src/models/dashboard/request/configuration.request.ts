import {ApiProperty} from "@nestjs/swagger";
import {UserPeriod} from "../../../entity/user-period.entity";
import {PartnerPeriod} from "../../../entity/partner-period.entity";
import {NgoPeriod} from "../../../entity/ngo-period.entity";

export class ConfigurationRequest {
    @ApiProperty()
    minNgoTransfer: number;
    @ApiProperty()
    minPersonalPool: number;
    @ApiProperty()
    userExpiration: number;
    @ApiProperty()
    userCloseInterval: number;
    @ApiProperty()
    partnerEmailInterval: number;
    @ApiProperty()
    partnerCloseInterval: number;
    @ApiProperty()
    ngoGenerateInterval: number;
    @ApiProperty()
    ngoCloseInterval: number;
    @ApiProperty()
    userFrom?: Date;
    @ApiProperty()
    partnerFrom?: Date;
    @ApiProperty()
    partnerSendMessagesAt?: Date;
    @ApiProperty()
    partnerNotEditableAt?: Date;
    @ApiProperty()
    ngoFrom?: Date;

    constructor(configuration: any, userPeriod?: UserPeriod, partnerPeriod?: PartnerPeriod, ngoPeriod?: NgoPeriod) {
        this.minNgoTransfer = configuration.minNgoTransfer;
        this.minPersonalPool = configuration.minPersonalPool;
        this.userExpiration = configuration.userExpiration;
        this.userCloseInterval = configuration.userCloseInterval;
        this.partnerEmailInterval = configuration.partnerEmailInterval;
        this.partnerCloseInterval = configuration.partnerCloseInterval;
        this.ngoGenerateInterval = configuration.ngoGenerateInterval;
        this.ngoCloseInterval = configuration.ngoCloseInterval;
        this.userFrom = userPeriod?.from;
        this.partnerFrom = partnerPeriod?.from;
        this.partnerSendMessagesAt = partnerPeriod?.sendMessagesAt;
        this.partnerNotEditableAt = partnerPeriod?.notEditableAt;
        this.ngoFrom = ngoPeriod?.from;
    }
}
