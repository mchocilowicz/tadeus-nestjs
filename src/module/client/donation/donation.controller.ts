import {BadRequestException, Body, Controller, Get, Logger, Post, Req, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiHeader, ApiResponse, ApiTags} from "@nestjs/swagger";
import {Const} from "../../../common/util/const";
import {User} from "../../../database/entity/user.entity";
import {Donation} from "../../../database/entity/donation.entity";
import {DonationEnum, PoolEnum} from "../../../common/enum/donation.enum";
import {CodeService} from "../../../common/service/code.service";
import {Ngo} from "../../../database/entity/ngo.entity";
import {getConnection} from "typeorm";
import {Configuration} from "../../../database/entity/configuration.entity";
import {NgoDonationRequest} from "../../../models/client/request/donation.request";
import {Roles} from "../../../common/decorators/roles.decorator";
import {RoleEnum} from "../../../common/enum/role.enum";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";
import {VirtualCard} from "../../../database/entity/virtual-card.entity";
import {UserPeriod} from "../../../database/entity/user-period.entity";

const moment = require("moment");

@Controller()
@ApiTags('donation')
export class DonationController {
    private readonly logger = new Logger(DonationController.name);

    constructor(private readonly codeService: CodeService) {
    }

    @Get()
    @ApiBearerAuth()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    @ApiResponse({status: 200, type: "boolean", description: "Check if user can make donation for selected NGO"})
    async getNgoSelectionCount(@Req() req: any) {
        let user: User = req.user;

        if (!user) {
            throw new BadRequestException('internal_server_error')
        }

        let canDonate = false;

        if (user.ngoSelectedAt) {
            const date = moment(user.ngoSelectedAt).add(30, 'days').format(Const.DATE_FORMAT);
            if (moment().format(Const.DATE_FORMAT) >= date) {
                canDonate = true;
            }
        }

        if (user.ngo) {
            return {
                canDonateSameNgo: canDonate,
                ngoName: user.ngo.name,
                ngoId: user.ngo.id
            }
        }

        return {
            canDonateSameNgo: canDonate
        }
    }

    @Post()
    @ApiBearerAuth()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async donationAnotherNgo(@Req() req: any, @Body() request: NgoDonationRequest) {
        const user: User = req.user;
        const virtualCard: VirtualCard | undefined = user.card;
        const config: Configuration | undefined = await Configuration.getMain();
        const period: UserPeriod | undefined = await UserPeriod.findActivePeriod();

        if (!config || !period) {
            this.logger.error('Configuration Table is not available');
            throw new BadRequestException("internal_server_error")
        }

        if (!virtualCard) {
            this.logger.error('Virtual Card Object is not available for User: ' + user.id);
            throw new BadRequestException("internal_server_error")
        }


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
            let cardChanged = false;
            if (request.ngoDonation > 0) {
                const ngo: Ngo | undefined = await Ngo.findOne({id: request.ngoId});

                if (!ngo) {
                    throw new BadRequestException('ngo_does_not_exists');
                }

                const ID = this.codeService.generateDonationID();
                const donation: Donation = new Donation(ID, request.payUextOrderId, DonationEnum.NGO, PoolEnum.PERSONAL, user, period, ngo);
                donation.price = request.ngoDonation;
                await entityManager.save(donation);
                const card = ngo.card;
                card.collectedMoney += request.ngoDonation;
                await entityManager.save(card);
                cardChanged = true;
            }

            if (request.tadeusDonation > 0) {
                const ngo: Ngo | undefined = await Ngo.findOne({isTadeus: true});

                if (!ngo) {
                    throw new BadRequestException('tadeus_does_not_exists');
                }

                const ID = this.codeService.generateDonationID();
                const donation: Donation = new Donation(ID, request.payUextOrderId, DonationEnum.TADEUS, PoolEnum.PERSONAL, user, period, ngo);
                donation.price = request.tadeusDonation;

                const card = ngo.card;
                card.collectedMoney += request.tadeusDonation;

                await entityManager.save(donation);
                await entityManager.save(card);
                cardChanged = true;
            }

            if (cardChanged) {
                virtualCard.personalPool -= request.tadeusDonation + request.ngoDonation;
                await entityManager.save(virtualCard);
            }
        });

    }
}
