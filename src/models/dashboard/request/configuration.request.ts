import {ApiProperty} from "@nestjs/swagger";

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


    constructor(configuration: any) {
        this.minNgoTransfer = configuration.minNgoTransfer;
        this.minPersonalPool = configuration.minPersonalPool;
        this.userExpiration = configuration.userExpiration;
        this.userCloseInterval = configuration.userCloseInterval;
        this.partnerEmailInterval = configuration.partnerEmailInterval;
        this.partnerCloseInterval = configuration.partnerCloseInterval;
        this.ngoGenerateInterval = configuration.ngoGenerateInterval;
        this.ngoCloseInterval = configuration.ngoCloseInterval;
    }
}
