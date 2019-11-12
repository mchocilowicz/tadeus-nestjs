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
import {ApiBearerAuth, ApiImplicitBody, ApiImplicitHeader, ApiResponse, ApiUseTags} from "@nestjs/swagger";
import {Roles} from "../../common/decorators/roles.decorator";
import {RoleEnum} from "../../common/enum/role.enum";
import {User} from "../../database/entity/user.entity";
import {JwtAuthGuard} from "../../common/guards/jwt.guard";
import {RolesGuard} from "../../common/guards/roles.guard";
import {getConnection} from "typeorm";
import {Const} from "../../common/util/const";
import {MainResponse} from "../../models/response/main.response";
import {ClientHistoryResponse} from "../../models/response/client-history.response";
import {VirtualCardResponse} from "../../models/response/virtual-card.response";
import {CodeService} from "../../common/service/code.service";
import {CodeVerificationRequest} from "../../models/request/code-verification.request";
import {LoginService} from "../common/login.service";
import {Transaction} from "../../database/entity/transaction.entity";
import {NewPhoneRequest} from "../../models/request/new-phone.request";
import {SignInResponse} from "../../models/response/signIn.response";
import {Notification} from "../../database/entity/notification.entity";
import {Opinion} from "../../database/entity/opinion.entity";
import {UserDetailsResponse} from "./models/response/user-details.response";
import {UserDetailsRequest} from "./models/user-details.request";
import {NotificationRequest} from "./models/notification.request";
import {VirtualCard} from "../../database/entity/virtual-card.entity";
import {Phone} from "../../database/entity/phone.entity";
import {TadeusEntity} from "../../database/entity/base.entity";
import {groupDatesByComponent} from "../../common/util/functions";
import {CalculationService} from "../../common/service/calculation.service";
import {Correction} from "../../database/entity/correction.entity";
import {Configuration} from "../../database/entity/configuration.entity";
import {PartnerPayment} from "../../database/entity/partner-payment.entity";
import {TradingPoint} from "../../database/entity/trading-point.entity";
import {Period} from "../../database/entity/period.entity";
import {Donation} from "../../database/entity/donation.entity";
import {DonationEnum, PoolEnum} from "../../common/enum/donation.enum";

const _ = require('lodash');
const moment = require('moment');

@Controller()
export class ClientController {

    private readonly logger = new Logger(ClientController.name);

    constructor(private readonly codeService: CodeService,
                private readonly service: LoginService,
                private readonly calService: CalculationService) {
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
        const card: VirtualCard | undefined = user.card;

        if (!card) {
            this.logger.error(`User ${user.id} does not have assigned  VirtualCard`);
            throw new BadRequestException('internal_server_error')
        }

        const count: number = await User.count();
        const s: number = count / 10;
        const detail: User[] = await User.findTopDetailsSortedByCollectedMoney(s);
        const maxMoney: number = detail.reduce((previousValue: number, currentValue: User) => previousValue + currentValue.collectedMoney, 0);
        const n: number = maxMoney / s;
        const result: number = n > 0 ? (100 * user.collectedMoney) / n : 0;

        return new MainResponse(user, card, result);
    }

    @Get('history')
    @ApiBearerAuth()
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
    async history(@Req() req: any) {
        const user: User = req.user;
        if (!user.id) {
            this.logger.error(`User ${user.id} does not exists`);
            throw new BadRequestException('internal_server_error')
        }

        let tempUser: User | undefined = await User.findOneWithistoryData(user.id);

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
    @ApiBearerAuth()
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
    virtualCard(@Req() req: any) {
        const user: User = req.user;
        const virtualCard: VirtualCard | undefined = user.card;

        if (!virtualCard) {
            this.logger.error(`User ${user.id} does not have assigned VirtualCard`);
            throw new BadRequestException('internal_server_error')
        }

        return new VirtualCardResponse(virtualCard);
    }

    @Put('user')
    @ApiBearerAuth()
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
    @ApiImplicitBody({name: '', type: UserDetailsRequest})
    async updateUserData(@Req() req: any, @Body() dto: UserDetailsRequest) {
        const user: User = req.user;
        const phone: Phone | undefined = user.phone;

        if (!phone) {
            this.logger.error(`User ${user.id} does not have assigned Phone`);
            throw new BadRequestException('internal_server_error')
        }

        phone.value = dto.phone;

        await getConnection().transaction(async entityManager => {

            user.updateInformation(dto.firstName, dto.lastName, dto.email, dto.bankAccount);
            await entityManager.save(user);
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
    getUserData(@Req() req: any): UserDetailsResponse {
        let user: User = req.user;
        let phone: Phone | undefined = user.phone;

        if (!phone) {
            this.logger.error(`User ${user.id} does not have assigned Phone`);
            throw new BadRequestException('internal_server_error')
        }

        return new UserDetailsResponse(user, phone);
    }

    @Get('notification')
    @ApiBearerAuth()
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
    async getNotificationForUser(@Req() req: any) {
        let user: User = req.user;
        let noti = await Notification.find({user: user});
        if (noti.length > 0) {
            await Notification.remove(noti)
        }
        return noti
    }

    @Get('opinion')
    @ApiBearerAuth()
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
    @ApiBearerAuth()
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
    @ApiImplicitBody({name: '', type: NotificationRequest})
    async createOpinion(@Req() req: any, @Body() dto: NotificationRequest) {
        let opinion = new Opinion(dto.email, dto.value, req.user);
        await opinion.save();
    }

    @ApiBearerAuth()
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
    @Post('correction/:id')
    async verifyCorrection(@Param('id') id: string, @Req() req: any) {
        const correction: Correction | undefined = await Correction.findOne({id: id});
        if (correction) {
            const user: User = req.user;
            if (correction.user.id === user.id) {
                await getConnection().transaction(async entityManager => {
                    if (user.card) {
                        const transaction: Transaction = correction.transaction;
                        const terminal = correction.terminal;
                        let tradingPoint: TradingPoint = terminal.tradingPoint;

                        const config: Configuration | undefined = await Configuration.getMain();
                        const period: Period | undefined = await Period.findCurrentPartnerPeriod();

                        if (!config || !period || !correction.terminal) {
                            this.logger.error('Configuration or Current Period or Terminal for Correction does not exists');
                            throw new BadRequestException('internal_server_error');
                        }

                        let payment: PartnerPayment | undefined = await PartnerPayment.findOne({period: period});

                        if (!payment) {
                            payment = new PartnerPayment(this.codeService.generatePartnerPaymentID(), tradingPoint, period);
                            payment = await entityManager.save(payment)
                        }

                        correction.isVerified = true;
                        correction.status = 'VERIFIED';
                        transaction.isCorrection = true;

                        const card = user.card;
                        user.xp -= transaction.userXp;
                        user.collectedMoney -= transaction.poolValue;

                        card.donationPool -= transaction.poolValue / 2;
                        card.personalPool -= transaction.poolValue / 2;

                        payment.price -= transaction.paymentValue;

                        await entityManager.save(transaction);
                        await entityManager.save(correction);


                        let donation: Donation | undefined = await Donation.getCurrentDonationForUser(user, period);
                        if (!donation) {
                            donation = new Donation(
                                this.codeService.generateDonationID(),
                                DonationEnum.NGO,
                                PoolEnum.DONATION,
                                user,
                                period
                            );
                            donation = await entityManager.save(donation);
                        }

                        let newTransaction: Transaction = new Transaction(
                            terminal,
                            user,
                            tradingPoint,
                            this.codeService.generateTransactionID(),
                            correction.price,
                            payment,
                            tradingPoint.vat,
                            tradingPoint.fee,
                            tradingPoint.donationPercentage,
                            donation
                        );

                        if (!user || !user || !user.card) {
                            throw new BadRequestException('user_does_not_exists')
                        }


                        const userXp = await this.calService.calculateXpForUser(user.id, user.xp, newTransaction, transaction);
                        const tradingPointXp = await this.calService.calculateXpForPartner(tradingPoint.id, newTransaction, transaction);

                        newTransaction.updateXpValues(userXp, tradingPointXp);
                        tradingPoint.xp = tradingPointXp + Number(tradingPoint.xp);

                        user.xp += userXp;

                        let pool = this.calService.calculateCost(correction.price, tradingPoint.donationPercentage, tradingPoint.vat);
                        let provision = this.calService.calculateCost(correction.price, tradingPoint.fee, tradingPoint.vat);

                        transaction.updatePaymentValues(provision, pool);

                        payment.price += transaction.paymentValue;

                        card.updatePool(pool);
                        user.updateCollectedMoney(pool);

                        await entityManager.save(transaction);

                        if (user.ngo) {
                            let card = user.ngo.card;
                            if (!card) {
                                this.logger.error(`Physical Card is not assigned to ngo ${user.ngo.id}`);
                                throw new BadRequestException('internal_server_error');
                            }
                            card.collectedMoney += pool;
                            await entityManager.save(card)
                        } else {
                            user.ngoTempMoney += pool;
                        }

                        await entityManager.save(payment);
                        await entityManager.save(card);
                        await entityManager.save(tradingPoint);
                        await entityManager.save(user);
                    }
                })
            }
        }
    }

}
