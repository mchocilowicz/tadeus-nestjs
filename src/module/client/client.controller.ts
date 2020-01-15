import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    Logger,
    Param,
    Post,
    Req,
    Res,
    UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiHeader, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator";
import { RoleEnum } from "../../common/enum/role.enum";
import { User } from "../../database/entity/user.entity";
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
import { Transaction } from "../../database/entity/transaction.entity";
import { NewPhoneRequest } from "../../models/common/request/new-phone.request";
import { SignInResponse } from "../../models/common/response/signIn.response";
import { VirtualCard } from "../../database/entity/virtual-card.entity";
import { TadeusEntity } from "../../database/entity/base.entity";
import { groupDatesByComponent } from "../../common/util/functions";
import { CalculationService } from "../../common/service/calculation.service";
import { PartnerPayment } from "../../database/entity/partner-payment.entity";
import { TradingPoint } from "../../database/entity/trading-point.entity";
import { Period } from "../../database/entity/period.entity";
import { UserPayout } from "../../database/entity/user-payment.entity";
import { FirebaseTokenRequest } from "../../models/client/request/firebase-token.request";
import { Account } from "../../database/entity/account.entity";
import { CorrectionRequest } from "../../models/client/request/correction.request";
import { TransactionStatus } from "../../common/enum/status.enum";

const _ = require('lodash');
const moment = require('moment');

@Controller()
@ApiBearerAuth()
@ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
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
    @ApiResponse({status: 200, type: MainResponse})
    @ApiBearerAuth()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async mainScreen(@Req() req: any) {
        const user: User = req.user;
        const card: VirtualCard | undefined = user.card;

        if (!card) {
            this.logger.error(`User ${ user.id } does not have assigned  VirtualCard`);
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

        let period: Period | undefined = await Period.findCurrentClientPeriod();
        if (!period) {
            throw new BadRequestException('internal_server_error')
        }

        return new MainResponse(user, card, ratingValue, payout, moment().isAfter(payout));
    }

    @Get('history')
    @ApiBearerAuth()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: ClientHistoryResponse})
    async history(@Req() req: any) {
        const user: User = req.user;
        if (!user.id) {
            this.logger.error(`User ${ user.id } does not exists`);
            throw new BadRequestException('internal_server_error')
        }

        let tempUser: User | undefined = await User.findOneWithHistoryData(user.id);

        if (!tempUser) {
            this.logger.error(`User ${ user.id } does not exists`);
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
    virtualCard(@Req() req: any) {
        const user: User = req.user;
        const virtualCard: VirtualCard | undefined = user.card;

        if (!virtualCard) {
            this.logger.error(`User ${ user.id } does not have assigned VirtualCard`);
            throw new BadRequestException('internal_server_error')
        }

        return new VirtualCardResponse(virtualCard);
    }

    @ApiBearerAuth()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
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
                .leftJoinAndSelect('user.card', 'card')
                .leftJoinAndSelect('user.ngo', 'ngo')
                .where('t.ID = :ID', {ID: dto.transactionID})
                .andWhere('t.isCorrection = true')
                .andWhere('correction IS NOT NULL')
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

            if (dto.userDecision) {
                transaction.status = TransactionStatus.ACCEPTED;

                const t: Transaction = transaction.correction;

                t.status = TransactionStatus.CORRECTED;

                const card: VirtualCard = user.card;
                const payment: PartnerPayment = t.payment;
                const point: TradingPoint = t.tradingPoint;
                const virtualCard: VirtualCard = user.card;


                user.xp += (-t.userXp + transaction.userXp);
                user.updateCollectedMoney(-t.poolValue + transaction.poolValue);
                point.xp += (-t.tradingPointXp + transaction.tradingPointXp);

                payment.price += (-t.paymentValue + Number(transaction.provision + transaction.poolValue));
                virtualCard.updatePool(-t.poolValue + transaction.poolValue);


                if (user.ngo) {
                    let card = user.ngo.card;
                    if (!card) {
                        this.logger.error(`Physical Card is not assigned to Ngo ${ user.ngo.id }`);
                        throw new BadRequestException('internal_server_error');
                    }
                    card.collectedMoney += (-t.poolValue + transaction.poolValue);
                    await entityManager.save(card)
                } else {
                    user.ngoTempMoney += (-t.poolValue + transaction.poolValue);
                }

                await entityManager.save(card);
                await entityManager.save(payment);
                await entityManager.save(point);
                await entityManager.save(user);
                await entityManager.save(t);
            } else {
                transaction.status = TransactionStatus.REJECTED
            }
            await entityManager.save(transaction);
        })
    }

    @Post('fcmToken')
    @ApiBearerAuth()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200})
    @ApiBody({type: FirebaseTokenRequest})
    async setUserFcmToken(@Req() req: any, @Body() dto: FirebaseTokenRequest) {
        const user: User = req.user;
        const account: Account = user.account;
        account.firebaseToken = dto.token;
        await account.save();
    }

    @Get('/img/:imageName')
    @ApiResponse({status: 200, type: "File", description: "Image"})
    getImage(@Param('imageName') imageName: string, @Res() res: any) {
        res.sendFile(imageName, {root: 'public/image'});
    }

}
