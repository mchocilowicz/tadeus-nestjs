import { BadRequestException, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { Const } from "../../../common/util/const";
import { User } from "../../../database/entity/user.entity";
import { Donation } from "../../../database/entity/donation.entity";
import { DonationEnum } from "../../../common/enum/donation.enum";
import { CodeService } from "../../../common/service/code.service";
import { Ngo } from "../../../database/entity/ngo.entity";
import { getConnection } from "typeorm";
import { VirtualCard } from "../../../database/entity/virtual-card.entity";
import { Configuration } from "../../../database/entity/configuration.entity";
import { UserDetails } from "../../../database/entity/user-details.entity";

@Controller()
@ApiUseTags('donation')
export class DonationController {
    constructor(private readonly codeService: CodeService) {
    }

    @Get()
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitHeader({
        name: Const.HEADER_AUTHORIZATION,
        required: true,
        description: Const.HEADER_AUTHORIZATION_DESC
    })
    @ApiUseTags('donation')
    @ApiResponse({status: 200, type: "boolean", description: "Check if user can make donation for selected NGO"})
    async getNgoSelectionCount(@Req() req) {
        let user: User = req.user;
        return user.details.ngoSelectionCount > 1;
    }

    @Post()
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitHeader({
        name: Const.HEADER_AUTHORIZATION,
        required: true,
        description: Const.HEADER_AUTHORIZATION_DESC
    })
    @ApiUseTags('donation')
    async donationSelectedNgo(@Req() req: any) {
        const user: User = req.user;
        let details: UserDetails = user.details;
        const config: Configuration = await Configuration.findOne({type: 'MAIN'});
        if (config && config.minPersonalPool > user.card.personalPool) {
            throw new BadRequestException('personal_pool_to_low')
        }
        const ngo: Ngo = details.ngo;
        if (!ngo) {
            throw new BadRequestException('ngo_not_selected')
        }
        const donation: Donation = new Donation();
        donation.ngo = ngo;
        donation.user = user;
        donation.type = DonationEnum.NGO;
        donation.pool = 'PERSONAL';
        donation.ID = this.codeService.generateDonationID();
        let card = user.card;
        let price = card.personalPool;
        donation.price = price;
        await getConnection().transaction(async entityManager => {
            await entityManager.save(donation);
            card.personalPool -= price;
            await entityManager.save(card);
        })
    }

    @Post(":ngoId")
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitHeader({
        name: Const.HEADER_AUTHORIZATION,
        required: true,
        description: Const.HEADER_AUTHORIZATION_DESC
    })
    @ApiUseTags('donation')
    async donationAnotherNgo(@Req() req: any, @Param('ngoId') ngoId: string) {
        const user: User = req.user;
        const config: Configuration = await Configuration.findOne({type: 'MAIN'});
        if (config && config.minPersonalPool > user.card.personalPool) {
            throw new BadRequestException('personal_pool_to_low')
        }
        let ngo: Ngo = await Ngo.findOne({id: ngoId});
        if (!ngo) {
            throw new BadRequestException('ngo_not_exists')
        }
        const donation: Donation = new Donation();
        donation.ngo = ngo;
        donation.user = user;
        donation.type = DonationEnum.NGO;
        donation.pool = 'PERSONAL';
        donation.ID = this.codeService.generateDonationID();
        let card: VirtualCard = user.card;
        let price: number = card.personalPool;
        donation.price = price;
        await getConnection().transaction(async entityManager => {
            await entityManager.save(donation);
            card.personalPool -= price;
            await entityManager.save(card);
        })
    }

    @Post("tadeus")
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitHeader({
        name: Const.HEADER_AUTHORIZATION,
        required: true,
        description: Const.HEADER_AUTHORIZATION_DESC
    })
    @ApiUseTags('donation')
    async donationTadeus(@Req() req) {
        const user: User = req.user;
        const ngo: Ngo = await Ngo.findOne({isTadeus: true});
        const config: Configuration = await Configuration.findOne({type: 'MAIN'});
        if (config && config.minPersonalPool > user.card.personalPool) {
            throw new BadRequestException('personal_pool_to_low')
        }

        const donation = new Donation();
        donation.ngo = ngo;
        donation.user = user;
        donation.type = DonationEnum.NGO;
        donation.pool = 'PERSONAL';
        donation.ID = this.codeService.generateDonationID();
        let card = user.card;
        let price = card.personalPool;
        donation.price = price;
        await getConnection().transaction(async entityManager => {
            await entityManager.save(donation);
            card.personalPool -= price;
            await entityManager.save(card);
        })
    }
}
