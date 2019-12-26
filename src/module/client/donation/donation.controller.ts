import { BadRequestException, Body, Controller, Get, Logger, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { Const } from "../../../common/util/const";
import { User } from "../../../database/entity/user.entity";
import { Donation } from "../../../database/entity/donation.entity";
import { DonationEnum, PoolEnum } from "../../../common/enum/donation.enum";
import { CodeService } from "../../../common/service/code.service";
import { Ngo } from "../../../database/entity/ngo.entity";
import { getConnection } from "typeorm";
import { VirtualCard } from "../../../database/entity/virtual-card.entity";
import { Configuration } from "../../../database/entity/configuration.entity";
import { NgoDonationRequest } from "../../../models/client/request/donation.request";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleEnum } from "../../../common/enum/role.enum";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Period } from "../../../database/entity/period.entity";

@Controller()
@ApiUseTags('donation')
export class DonationController {
    private readonly logger = new Logger(DonationController.name);

    constructor(private readonly codeService: CodeService) {
    }

    @Get()
    @ApiBearerAuth()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
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
    @ApiResponse({status: 200, type: "boolean", description: "Check if user can make donation for selected NGO"})
    async getNgoSelectionCount(@Req() req: any) {
        let user: User = req.user;

        if (!user) {
            throw new BadRequestException('internal_server_error')
        }

        if (user.ngo) {
            return {
                canDonateSameNgo: user.ngoSelectionCount > 1,
                ngoName: user.ngo.name,
                ngoId: user.ngo.id
            }
        }

        return {
            canDonateSameNgo: user.ngoSelectionCount > 1
        }
    }

    @Post()
    @ApiBearerAuth()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
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
    async donationAnotherNgo(@Req() req: any, @Body() request: NgoDonationRequest) {
        const user: User = req.user;
        // const virtualCard: VirtualCard | undefined = user.card;
        const config: Configuration | undefined = await Configuration.getMain();
        const period: Period | undefined = await Period.findCurrentNgoPeriod();

        if (!config || !period) {
            this.logger.error('Configuration Table is not available');
            throw new BadRequestException("internal_error")
        }

        // if (!virtualCard) {
        //     this.logger.error('Virtual Card Object is not available for User: ' + user.id);
        //     throw new BadRequestException("internal_error")
        // }
        //
        // const totalPrice = request.ngoDonation + request.tadeusDonation;
        //
        // if (config.minNgoTransfer > totalPrice) {
        //     throw new BadRequestException('donation_value_to_low')
        // }
        //
        // if (totalPrice > virtualCard.personalPool) {
        //     throw new BadRequestException('personal_pool_to_low')
        // }

        await getConnection().transaction(async entityManager => {
            if (request.ngoDonation > 0) {
                let ngo: Ngo | undefined = await Ngo.findOne({id: request.ngoId});

                if (!ngo) {
                    throw new BadRequestException('ngo_does_not_exists');
                }

                const ID = this.codeService.generateDonationID();
                const donation: Donation = new Donation(ID, DonationEnum.NGO, PoolEnum.PERSONAL, user, period);
                donation.ngo = ngo;
                donation.price = request.ngoDonation;
                donation.invoiceNumber = request.payUextOrderId;
                // virtualCard.personalPool -= request.ngoDonation;
                await entityManager.save(donation);
            }

            if (request.tadeusDonation > 0) {
                const ID = this.codeService.generateDonationID();
                const donation: Donation = new Donation(ID, DonationEnum.TADEUS, PoolEnum.PERSONAL, user, period);
                donation.price = request.tadeusDonation;
                donation.ngo = await Ngo.findOne({isTadeus: true});
                donation.invoiceNumber = request.payUextOrderId;
                // virtualCard.personalPool -= request.tadeusDonation;
                await entityManager.save(donation);
            }

            // await entityManager.save(virtualCard);
        });

    }
}
