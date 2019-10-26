import { BadRequestException, Body, Controller, Get, Logger, Param, Post, Req } from "@nestjs/common";
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
import { NgoDonationRequest, TadeusDonationRequest } from "../models/response/donation.request";
import { UserDetails } from "../../../database/entity/user-details.entity";

@Controller()
@ApiUseTags('donation')
export class DonationController {
    private readonly logger = new Logger(DonationController.name);

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
    async getNgoSelectionCount(@Req() req: any) {
        let user: User = req.user;
        const details: UserDetails | undefined = user.details;

        if (!details) {
            this.logger.error('Details Object is not available for User: ' + user.id);
            throw new BadRequestException('internal_server_error')
        }

        if (details.ngo) {
            return {
                canDonateSameNgo: details.ngoSelectionCount > 1,
                ngoName: details.ngo.name,
                ngoId: details.ngo.id
            }
        }

        return {
            canDonateSameNgo: details.ngoSelectionCount > 1
        }
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
    async donationAnotherNgo(@Req() req: any, @Param('ngoId') ngoId: string, @Body() request: NgoDonationRequest) {
        const user: User = req.user;
        const virtualCard: VirtualCard | undefined = user.card;
        const config: Configuration | undefined = await Configuration.findOne({type: 'MAIN'});
        const ngo: Ngo | undefined = await Ngo.findOne({id: ngoId});

        if (!ngo) {
            throw new BadRequestException('ngo_not_exists')
        }

        if (!config) {
            this.logger.error('Configuration Table is not available');
            throw new BadRequestException("internal_error")
        }

        if (!virtualCard) {
            this.logger.error('Virtual Card Object is not available for User: ' + user.id);
            throw new BadRequestException("internal_error")
        }

        const totalPrice = request.ngoDonationValue + request.tadeusDonationValue;

        if (config.minPersonalPool > totalPrice) {
            throw new BadRequestException('donation_value_to_low')
        }

        if (totalPrice > virtualCard.personalPool) {
            throw new BadRequestException('personal_pool_to_low')
        }

        await getConnection().transaction(async entityManager => {
            if (request.ngoDonationValue > 0) {
                const ID = this.codeService.generateDonationID();
                const donation: Donation = new Donation(ID, DonationEnum.NGO, 'PERSONAL', request.ngoDonationValue, ngo, user);
                virtualCard.personalPool -= request.ngoDonationValue;
                await entityManager.save(donation);
            }

            if (request.tadeusDonationValue > 0) {
                const ID = this.codeService.generateDonationID();
                const donation: Donation = new Donation(ID, DonationEnum.TADEUS, 'PERSONAL', request.ngoDonationValue, ngo, user);
                virtualCard.personalPool -= request.ngoDonationValue;
                await entityManager.save(donation);
            }

            await entityManager.save(virtualCard);
        });

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
    async donationTadeus(@Req() req: any, @Body() request: TadeusDonationRequest) {
        const user: User = req.user;
        const ngo: Ngo | undefined = await Ngo.findOne({isTadeus: true});
        const card: VirtualCard | undefined = user.card;
        const config: Configuration | undefined = await Configuration.findOne({type: 'MAIN'});

        if (!ngo) {
            this.logger.error('TADEUS NGO Object is not available');
            throw new BadRequestException("ngo_does_not_exists")
        }
        if (!card) {
            this.logger.error('Details Object is not available for User: ' + user.id);
            throw new BadRequestException("internal_server_error")
        }

        if (!config) {
            this.logger.error('Configuration Table is not available');
            throw new BadRequestException("internal_server_error")
        }

        if (config.minPersonalPool > request.donationValue) {
            throw new BadRequestException('donation_value_to_low')
        }
        if (request.donationValue > card.personalPool) {
            throw new BadRequestException('personal_pool_to_low')
        }

        await getConnection().transaction(async entityManager => {
            if (request.donationValue > 0) {
                const ID = this.codeService.generateDonationID();
                const donation: Donation = new Donation(ID, DonationEnum.TADEUS, 'PERSONAL', request.donationValue, ngo, user);
                card.personalPool -= request.donationValue;
                await entityManager.save(donation);
                await entityManager.save(card);
            }
        });
    }
}
