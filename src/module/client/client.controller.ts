import { Body, Controller, Get, HttpCode, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
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
import { CodeVerificationRequest } from "../../models/request/code-verification.request";
import { LoginService } from "../common/login.service";
import { Transaction } from "../../database/entity/transaction.entity";
import { NewPhoneRequest } from "../../models/request/new-phone.request";
import { SignInResponse } from "../../models/response/signIn.response";
import { Notification } from "../../database/entity/notification.entity";
import { Opinion } from "../../database/entity/opinion.entity";
import { UserDetailsResponse } from "./models/response/user-details.response";
import { UserDetailsRequest } from "./models/user-details.request";
import { NotificationRequest } from "./models/notification.request";

@Controller()
export class ClientController {

    constructor(private readonly codeService: CodeService,
                private readonly service: LoginService) {
    }

    @Post('signIn')
    @ApiUseTags('auth')
    @HttpCode(200)
    @ApiResponse({status: 200, type: SignInResponse})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: NewPhoneRequest})
    async signIn(@Body() dto: NewPhoneRequest) {
        return {
            userExists: await this.service.clientSignIn(dto)
        }
    }

    @Post('anonymous')
    @ApiUseTags('auth')
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
    @ApiUseTags('auth')
    @ApiResponse({status: 200, type: 'string', description: 'Authorization token'})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: CodeVerificationRequest})
    verifyCode(@Body() dto: CodeVerificationRequest) {
        return this.service.checkClientCode(dto);
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
    @ApiResponse({status: 200, type: MainResponse})
    @ApiBearerAuth()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async mainScreen(@Req() req) {
        return new MainResponse(req.user);
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
    @ApiBearerAuth()
    async history(@Req() req) {
        const user: User = req.user;

        let tempUser: any = await createQueryBuilder("User")
            .leftJoinAndSelect("User.transactions", "transactions")
            .leftJoinAndSelect("User.donations", "donations")
            .leftJoinAndSelect("donations.ngo", 'ngo')
            .where("User.id = :id", {id: user.id})
            .getOne();

        return new ClientHistoryResponse(tempUser)
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
    @ApiBearerAuth()
    virtualCard(@Req() req) {
        let user: User = req.user;
        return new VirtualCardResponse(user.card);
    }


    @Get('correction')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: []})
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
    @ApiBearerAuth()
    async getCorrections(@Req() req: any) {
        return await Transaction.find({user: req.user, isCorrection: true})
    }

    @Put('correction/:id')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: []})
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
    @ApiBearerAuth()
    async approveCorrection(@Param('id') id: string) {
        let t = await Transaction.findOne({id: id});
        t.verifiedByUser = true;
        await t.save()
    }

    @Put('user')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: []})
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
    @ApiUseTags('user')
    @ApiBearerAuth()
    @ApiImplicitBody({name: '', type: UserDetailsRequest})
    async updateUserData(@Req() req, @Body() dto: UserDetailsRequest) {
        let user: User = req.user;
        user.email = dto.email;
        user.phonePrefix = dto.phonePrefix;
        user.phone = dto.phone;
        user.details.bankAccount = dto.bankAccount;
        user.details.name = dto.firstName;
        user.details.lastName = dto.lastName;
        await user.details.save();
        await user.save();
    }

    @Get('user')
    @ApiBearerAuth()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: UserDetailsResponse})
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
    @ApiUseTags('user')
    @ApiBearerAuth()
    getUserData(@Req() req) {
        let user: User = req.user;
        return new UserDetailsResponse(user);

    }

    @Get('notification')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: [Notification]})
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
    @ApiBearerAuth()
    async getNotificationForUser(@Req() req) {
        let user: User = req.user;
        let noti = await Notification.find({user: user});
        if (noti.length > 0) {
            await Notification.remove(noti)
        }
        return noti
    }

    @Get('opinion')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: "string", description: 'User email'})
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
    @ApiBearerAuth()
    async getEmailForOption(@Req() req) {
        return req.user.email;
    }

    @Post('opinion')
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200})
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
    @ApiBearerAuth()
    @ApiImplicitBody({name: '', type: NotificationRequest})
    async createOpinion(@Req() req, @Body() dto: NotificationRequest) {
        let opinion = new Opinion();
        opinion.email = dto.email;
        opinion.value = dto.value;
        opinion.user = req.user;
        await opinion.save();
    }

}
