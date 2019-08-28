import { BadRequestException, Controller, Param, Post, Req } from "@nestjs/common";
import { ApiImplicitHeader, ApiUseTags } from "@nestjs/swagger";
import { Const } from "../../../common/util/const";
import { User } from "../../../database/entity/user.entity";
import { Donation } from "../../../database/entity/donation.entity";
import { DonationEnum } from "../../../common/enum/donation.enum";
import { CodeService } from "../../../common/service/code.service";
import { Ngo } from "../../../database/entity/ngo.entity";
import { getConnection } from "typeorm";

@Controller()
@ApiUseTags('client/donation')
export class DonationController {
    constructor(private readonly codeService: CodeService) {
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
    async donationSelectedNgo(@Req() req: any) {
        const user: User = req.user;
        const ngo = user.ngo;
        if (!ngo) {
            throw new BadRequestException('ngo_not_selected')
        }
        const donation = new Donation();
        donation.ngo = ngo;
        donation.user = user;
        donation.type = DonationEnum.NGO;
        donation.ID = this.codeService.generateDonationID();
        let price = user.personalPool;
        donation.price = price;
        await getConnection().transaction(async entityManager => {
            await entityManager.save(donation);
            user.personalPool -= price;
            await entityManager.save(user);
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
    async donationAnotherNgo(@Req() req: any, @Param('ngoId') ngoId: string) {
        const user: User = req.user;
        let ngo = await Ngo.findOne({id: ngoId});
        if (!ngo) {
            throw new BadRequestException('ngo_not_exists')
        }
        const donation = new Donation();
        donation.ngo = ngo;
        donation.user = user;
        donation.type = DonationEnum.NGO;
        donation.ID = this.codeService.generateDonationID();
        let price = user.personalPool;
        donation.price = price;
        await getConnection().transaction(async entityManager => {
            await entityManager.save(donation);
            user.personalPool -= price;
            await entityManager.save(user);
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
    async donationTadeus() {

    }
}
