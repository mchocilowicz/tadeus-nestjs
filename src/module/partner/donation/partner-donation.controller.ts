import { BadRequestException, Body, Controller, Get, Put, Req, UseGuards } from "@nestjs/common";
import { Terminal } from "../../../database/entity/terminal.entity";
import { TradingPoint } from "../../../database/entity/trading-point.entity";
import { Period } from "../../../database/entity/period.entity";
import { PartnerPayment } from "../../../database/entity/partner-payment.entity";
import { CodeService } from "../../../common/service/code.service";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleEnum } from "../../../common/enum/role.enum";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { ApiBearerAuth, ApiBody, ApiHeader, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PartnerPaymentResponse } from "../../../models/partner/response/partner-payment.response";
import { Const } from "../../../common/util/const";
import { DonationRequest } from "../../../models/partner/request/donation.request";

@Controller()
@ApiTags('donation')
@ApiBearerAuth()
@ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
@ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
export class PartnerDonationController {

    constructor(private readonly codeService: CodeService) {
    }

    @Get()
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: PartnerPaymentResponse})
    async getPaymentInformation(@Req() req: any) {
        let terminal: Terminal = req.user;
        let point: TradingPoint = terminal.tradingPoint;

        let period = await Period.findCurrentPartnerPeriod();
        if (!period) {
            throw new BadRequestException('')
        }

        let payment: PartnerPayment | undefined = await PartnerPayment.findOne({period: period, tradingPoint: point});
        return new PartnerPaymentResponse(period.to, payment)
    }

    @Put()
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBody({type: DonationRequest})
    async updatePaymentInformation(@Req() req: any, @Body() dto: DonationRequest) {
        let payment: PartnerPayment | undefined = await PartnerPayment.findOne({id: dto.paymentId});
        if (!payment) {
            throw new BadRequestException('partner_payment_does_not_exists')
        }

        if (payment.isPaid) {
            throw new BadRequestException('partner_payment_payed')
        }

        payment.isPaid = true;
        payment.paymentNumber = dto.payUextOrderId;
        payment.partnerPaymentAt = new Date();
        await payment.save();
    }

}
