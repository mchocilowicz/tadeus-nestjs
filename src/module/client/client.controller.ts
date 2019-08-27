import { Body, Controller, Get, HttpCode, Logger, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiImplicitBody, ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator";
import { RoleEnum } from "../../common/enum/role.enum";
import { User } from "../../database/entity/user.entity";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { createQueryBuilder } from "typeorm";
import { Const } from "../../common/util/const";
import { MainResponse } from "../../models/response/main.response";
import { ClientHistoryResponse } from "../../models/response/client-history.response";
import { VirtualCardResponse } from "../../models/response/virtual-card.response";
import { CodeService } from "../../common/service/code.service";
import { PhoneRequest } from "../../models/request/phone.request";
import { CodeVerificationRequest } from "../../models/request/code-verification.request";
import { LoginService } from "../common/login.service";


@Controller()
@ApiBearerAuth()
export class ClientController {
    private readonly logger = new Logger(ClientController.name);

    constructor(private readonly codeService: CodeService, private readonly service: LoginService) {
    }

    @Post('signIn')
    @ApiUseTags('client/auth')
    @HttpCode(200)
    @ApiResponse({status: 200, type: null})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: PhoneRequest})
    async signIn(@Body() phone: PhoneRequest) {
        await this.service.signIn(phone, RoleEnum.CLIENT);
    }

    @Post('anonymous')
    @ApiUseTags('client/auth')
    @ApiResponse({status: 200, type: "string", description: 'Authorization Token'})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    createAnonymous() {
        return this.service.createAnonymousUser();
    }

    @Post('code')
    @ApiUseTags('client/auth')
    @ApiResponse({status: 200, type: 'string', description: 'Authorization token'})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: CodeVerificationRequest})
    verifyCode(@Body() dto: CodeVerificationRequest) {
        return this.service.checkVerificationCode(dto);
    }


    @Get()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiUseTags('client')
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
    @ApiResponse({status: 200, type: MainResponse})
    @ApiUseTags('client')
    async mainScreen(@Req() req) {
        const user: User = req.user;
        const dto = new MainResponse();
        dto.ngo = user.ngo;
        dto.donationPool = user.donationPool;
        dto.collectedMoney = user.collectedMoney;
        dto.xp = user.xp;
        dto.name = user.name;
        return dto
    }

    @Get('history')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: ClientHistoryResponse})
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
    @ApiUseTags('client')
    async history(@Req() req) {
        const user: User = req.user;

        let tempUser: any = await createQueryBuilder("User")
            .leftJoinAndSelect("User.transactions", "transactions")
            .leftJoinAndSelect("User.donations", "donations")
            .leftJoinAndSelect("donations.ngo", 'ngo')
            .where("User.id = :id", {id: user.id})
            .getOne();

        return {
            transactions: tempUser.transactions,
            donations: tempUser.donations
        }
    }

    @Get('card')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: VirtualCardResponse})
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
    @ApiUseTags('client')
    virtualCard(@Req() req) {
        const card = new VirtualCardResponse();
        let user: User = req.user;
        let virtualCard = user.card;
        card.code = virtualCard.code;
        card.cardNumber = virtualCard.ID;
        return card;
    }
}
