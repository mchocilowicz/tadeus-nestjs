import {
    BadRequestException, Body, Controller, Get, HttpCode, Logger, Param, Post, Put, Req, Res, UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiHeader, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator";
import { RoleType } from "../../common/enum/roleType";
import { User } from "../../entity/user.entity";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { getConnection } from "typeorm";
import { Const } from "../../common/util/const";
import { MainResponse } from "../../models/common/response/main.response";
import { ClientHistoryResponse } from "../../models/common/response/client-history.response";
import { VirtualCardResponse } from "../../models/common/response/virtual-card.response";
import { CodeService } from "../../common/service/code.service";
import { CodeVerificationRequest } from "../../models/common/request/code-verification.request";
import { LoginService } from "../common/login.service";
import { Transaction } from "../../entity/transaction.entity";
import { NewPhoneRequest } from "../../models/common/request/new-phone.request";
import { SignInResponse } from "../../models/common/response/signIn.response";
import { VirtualCard } from "../../entity/virtual-card.entity";
import { TadeusEntity } from "../../entity/base.entity";
import { groupDatesByComponent, roundToTwo } from "../../common/util/functions";
import { CalculationService } from "../../common/service/calculation.service";
import { TradingPoint } from "../../entity/trading-point.entity";
import { UserPayout } from "../../entity/user-payout.entity";
import { FirebaseTokenRequest } from "../../models/client/request/firebase-token.request";
import { Account } from "../../entity/account.entity";
import { CorrectionRequest } from "../../models/client/request/correction.request";
import { TransactionStatus } from "../../common/enum/status.enum";
import { Ngo } from "../../entity/ngo.entity";
import { PhysicalCard } from "../../entity/physical-card.entity";
import { TierService } from "../common/tier.service";

const _ = require('lodash');
const moment = require('moment');

@Controller() @ApiBearerAuth() @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
export class ClientController {

    private readonly logger = new Logger(ClientController.name);

    constructor(private readonly codeService: CodeService,
                private readonly service: LoginService,
                private readonly calService: CalculationService) {
    }

    @Post('signIn')
    @ApiTags('auth')
    @HttpCode(200)
    @ApiResponse({status: 200, type: SignInResponse})
    @ApiBody({type: NewPhoneRequest})
    async signIn(@Body() dto: NewPhoneRequest): Promise<SignInResponse> {
        const userExists = await this.service.clientSignIn(dto);
        return new SignInResponse(userExists);
    }

    @Post('anonymous')
    @ApiTags('auth')
    @ApiResponse({status: 200, type: "string", description: 'Authorization Token'})
    createAnonymous(): Promise<string> {
        return this.service.createAnonymousUser();
    }

    @Post('code')
    @ApiTags('auth')
    @ApiResponse({status: 200, type: 'string', description: 'Authorization token'})
    @ApiBody({type: CodeVerificationRequest})
    verifyCode(@Body() dto: CodeVerificationRequest) {
        return this.service.checkCodeForUser(dto);
    }

    @Get()
    @ApiResponse({status: 200, type: MainResponse}) @ApiBearerAuth() @Roles(RoleType.CLIENT) @UseGuards(JwtAuthGuard, RolesGuard)
    async mainScreen(@Req() req: any) {
        const user: User = req.user;
        const card: VirtualCard | undefined = user.card;

        if (!card) {
            this.logger.error(`User ${user.id} does not have assigned  VirtualCard`);
            throw new BadRequestException('internal_server_error')
        }

        const payouts: UserPayout[] = await UserPayout.find({user: user});
        let payout = moment(user.createdAt).add(30, 'days');
        if (payouts.length > 0) {
            let last = _.sortBy(payouts, 'createdAt')[payouts.length - 1];
            payout = moment(last.createdAt).add(30, 'days');
        }

        const usersInLast30Days: User[] = await User.findTopDetailsSortedByCollectedMoney();
        const tenPercentage: number = (usersInLast30Days.length * 10) / 100;
        const topXp: number = usersInLast30Days
            .slice(0, tenPercentage)
            .reduce((previousValue: number, currentValue: User) => previousValue + currentValue.xp, 0);

        const userXpRating = (user.xp / topXp) * 100;
        const ratingValue = userXpRating > 100 ? 100 : userXpRating;

        let ngoChange = true;
        if (user.ngoSelectedAt) {
            let date = moment(user.ngoSelectedAt).add(30, 'days');
            if (moment().isAfter(date)) {
                ngoChange = true
            } else {
                ngoChange = false;
            }
        }

        return new MainResponse(user, card, ratingValue, payout, moment().isAfter(payout), ngoChange);
    }

    @Get('history') @ApiBearerAuth() @Roles(RoleType.CLIENT) @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: ClientHistoryResponse})
    async history(@Req() req: any) {
        const user: User = req.user;
        if (!user.id) {
            this.logger.error(`User ${user.id} does not exists`);
            throw new BadRequestException('internal_server_error')
        }

        let tempUser: User | undefined = await User.findOneWithHistoryData(user.id);

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
        if (tempUser.donations) {
            transactions = transactions.concat(tempUser.donations)
        }

        let transactionHistoryWithPayouts = groupDatesByComponent(transactions, 'Y')
            .map((i: TadeusEntity[]) => groupDatesByComponent(i, 'DDD'));

        return new ClientHistoryResponse(tempUser.donations, _.flatten(transactionHistoryWithPayouts))
    }

    @Get('card') @ApiBearerAuth() @Roles(RoleType.CLIENT) @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: VirtualCardResponse})
    virtualCard(@Req() req: any) {
        const user: User = req.user;
        const virtualCard: VirtualCard | undefined = user.card;

        if (!virtualCard) {
            this.logger.error(`User ${user.id} does not have assigned VirtualCard`);
            throw new BadRequestException('internal_server_error')
        }

        return new VirtualCardResponse(virtualCard);
    }

    @ApiBearerAuth() @Roles(RoleType.CLIENT) @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200})
    @Post('correction')
    async verifyTransaction(@Req() req: any, @Body() dto: CorrectionRequest) {
        await getConnection().transaction(async entityManager => {
            const user: User = req.user;

            let transaction: Transaction | undefined = await Transaction.createQueryBuilder('t')
                                                                        .leftJoinAndSelect('t.user', 'user')
                                                                        .leftJoinAndSelect('t.terminal', 'terminal')
                                                                        .leftJoinAndSelect('t.tradingPoint', 'point')
                                                                        .leftJoinAndSelect('t.correction', 'correction')
                                                                        .leftJoinAndSelect('t.payment', 'payment')
                                                                        .leftJoinAndSelect('t.ngo', 'ngo')
                                                                        .leftJoinAndSelect('ngo.card', 'ngoCard')
                                                                        .leftJoinAndSelect('user.card', 'virtualCard')
                                                                        .where('t.ID = :ID', { ID: dto.transactionID })
                                                                        .andWhere('terminal.ID = :terminal', { terminal: dto.terminalID })
                                                                        .andWhere('t.status = :status', { status: TransactionStatus.WAITING })
                                                                        .andWhere('virtualCard.status = :cardStatus', {cardStatus: 'ACTIVE'})
                                                                        .getOne();

            if (!transaction) {
                throw new BadRequestException('transaction_does_not_exists')
            }

            if (!transaction.correction) {
                throw new BadRequestException('transaction_does_not_exists')
            }

            if (transaction.user.id !== user.id) {
                throw new BadRequestException('transaction_does_not_belong_to_user')
            }

            const correctedTransaction: Transaction = transaction.correction;

            if (dto.userDecision) {
                correctedTransaction.status = TransactionStatus.CORRECTED;

                transaction.status = TransactionStatus.ACCEPTED;

                const point: TradingPoint = transaction.tradingPoint;
                const virtualCard: VirtualCard = user.card;
                const ngo: Ngo = transaction.ngo;
                const card: PhysicalCard = ngo.card;

                if (transaction.price === 0) {
                    const pool = roundToTwo(-correctedTransaction.poolValue / 2);

                    user.xp -= correctedTransaction.userXp;
                    user.updateCollectedMoney(-correctedTransaction.poolValue);
                    point.xp -= correctedTransaction.tradingPointXp;
                    TierService.asignTier(pool, user, virtualCard)
                    virtualCard.updatePool(-correctedTransaction.poolValue);
                    card.collectedMoney -= correctedTransaction.poolValue;
                } else {
                    const pool = roundToTwo((-transaction.poolValue + correctedTransaction.poolValue) / 2);
                    TierService.asignTier(pool, user, virtualCard)
                    user.updateCollectedMoney(-transaction.poolValue + correctedTransaction.poolValue);
                    virtualCard.updatePool(-transaction.poolValue + correctedTransaction.poolValue);
                    card.collectedMoney += (-transaction.poolValue + correctedTransaction.poolValue);
                }

                await entityManager.save(card);
                await entityManager.save(virtualCard);
                await entityManager.save(point);
                await entityManager.save(user);
                await entityManager.save(correctedTransaction);
            } else {
                transaction.status = TransactionStatus.REJECTED
            }
            await entityManager.save(transaction);
        })
    }

    @Post('fcmToken') @ApiBearerAuth() @Roles(RoleType.CLIENT) @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200})
    @ApiBody({type: FirebaseTokenRequest})
    async setUserFcmToken(@Req() req: any, @Body() dto: FirebaseTokenRequest) {
        const user: User = req.user;
        const account: Account = user.account;
        account.firebaseToken = dto.token;
        await account.save();
    }

    @Put('activeCard') @ApiBearerAuth() @Roles(RoleType.CLIENT) @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200})
    async activeVirtualCard(@Req() req: any) {
        const user: User = req.user;
        const card: VirtualCard = user.card;
        card.status = "ACTIVE";
        await card.save();
    }

    @Get('/img/:imageName')
    @ApiResponse({status: 200, type: "File", description: "Image"})
    getImage(@Param('imageName') imageName: string, @Res() res: any) {
        res.sendFile(imageName, {root: 'public/image'});
    }

}
