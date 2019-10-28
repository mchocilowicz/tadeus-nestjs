import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    Logger,
    Param,
    Post,
    Put,
    Req,
    UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiImplicitBody, ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator";
import { RoleEnum } from "../../common/enum/role.enum";
import { User } from "../../database/entity/user.entity";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { getConnection } from "typeorm";
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
import { UserDetails } from "../../database/entity/user-details.entity";
import { VirtualCard } from "../../database/entity/virtual-card.entity";
import { Phone } from "../../database/entity/phone.entity";
import { TadeusEntity } from "../../database/entity/base.entity";
import { groupDatesByComponent } from "../../common/util/functions";

const _ = require('lodash');

@Controller()
export class ClientController {

    private readonly logger = new Logger(ClientController.name);

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
    async signIn(@Body() dto: NewPhoneRequest): Promise<SignInResponse> {
        const userExists = await this.service.clientSignIn(dto);
        return new SignInResponse(userExists);
    }

    @Post('anonymous')
    @ApiUseTags('auth')
    @ApiResponse({status: 200, type: "string", description: 'Authorization Token'})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    createAnonymous(): Promise<string> {
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
    async mainScreen(@Req() req: any) {
        const user: User = req.user;
        const details = user.details;
        const card = user.card;

        if (!card || !details) {
            this.logger.error(`User ${user.id} does not have assigned Details or VirtualCard`);
            throw new BadRequestException('internal_server_error')
        }

        return new MainResponse(details, card);
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
    async history(@Req() req: any) {
        const user: User = req.user;

        let tempUser: User | undefined = await User.createQueryBuilder("user")
            .leftJoinAndSelect("user.transactions", "transactions")
            .leftJoinAndSelect('user.payouts', 'payouts')
            .leftJoinAndSelect("user.donations", "donations")
            .leftJoinAndSelect("donations.ngo", 'ngo')
            .where("user.id = :id", {id: user.id})
            .getOne();

        if (!tempUser) {
            this.logger.error(`User ${user.id} does not exists`);
            throw new BadRequestException('internal_server_error')
        }

        let transactions: TadeusEntity[] = [];

        if (tempUser.transactions) {
            transactions = transactions.concat(tempUser.transactions)
        }
        if (tempUser.payouts) {
            transactions = transactions.concat(tempUser.payouts)
        }

        let transactionHistoryWithPayouts = groupDatesByComponent(transactions, 'Y')
            .map((i: TadeusEntity[]) => groupDatesByComponent(i, 'DDD'));

        return new ClientHistoryResponse(tempUser.donations, _.flatten(transactionHistoryWithPayouts))
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
    virtualCard(@Req() req: any) {
        const user: User = req.user;
        const virtualCard: VirtualCard | undefined = user.card;

        if (!virtualCard) {
            this.logger.error(`User ${user.id} does not have assigned VirtualCard`);
            throw new BadRequestException('internal_server_error')
        }

        return new VirtualCardResponse(virtualCard);
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
        if (t) {
            t.verifiedByUser = true;
            await t.save()
        }
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
    async updateUserData(@Req() req: any, @Body() dto: UserDetailsRequest) {
        const user: User = req.user;
        const details: UserDetails | undefined = user.details;
        const phone = user.phone;

        if (!details || !phone) {
            this.logger.error(`User ${user.id} does not have assigned Details or Phone`);
            throw new BadRequestException('internal_server_error')
        }

        details.email = dto.email;
        phone.value = dto.phone;

        await getConnection().transaction(async entityManager => {
            details.bankAccount = dto.bankAccount;
            details.name = dto.firstName;
            details.lastName = dto.lastName;

            await entityManager.save(details);
            await entityManager.save(phone);
        });
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
    getUserData(@Req() req: any): UserDetailsResponse {
        let user: User = req.user;
        let details: UserDetails | undefined = user.details;
        let phone: Phone | undefined = user.phone;

        if (!details || !phone) {
            this.logger.error(`User ${user.id} does not have assigned Details or Phone`);
            throw new BadRequestException('internal_server_error')
        }

        return new UserDetailsResponse(details, phone);
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
    async getNotificationForUser(@Req() req: any) {
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
    async getEmailForOption(@Req() req: any) {
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
    async createOpinion(@Req() req: any, @Body() dto: NotificationRequest) {
        let opinion = new Opinion(dto.email, dto.value, req.user);
        await opinion.save();
    }

}
