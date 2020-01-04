import { BadRequestException, Controller, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import { Terminal } from "../../../database/entity/terminal.entity";
import { TradingPoint } from "../../../database/entity/trading-point.entity";
import { Period } from "../../../database/entity/period.entity";
import { PartnerPayment } from "../../../database/entity/partner-payment.entity";
import { CodeService } from "../../../common/service/code.service";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleEnum } from "../../../common/enum/role.enum";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { ApiBearerAuth, ApiImplicitBody, ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { PartnerPaymentResponse } from "../../../models/partner/response/partner-payment.response";
import { Const } from "../../../common/util/const";
import { DonationRequest } from "../../../models/partner/request/donation.request";

@Controller()
@ApiUseTags('donation')
@ApiBearerAuth()
export class PartnerDonationController {

    constructor(private readonly codeService: CodeService) {
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

    @Put(':id')
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
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiImplicitBody({name: '', type: DonationRequest})
    async updatePaymentInformation(@Req() req: any, @Param('id') id: string, dto: DonationRequest) {
        let payment: PartnerPayment | undefined = await PartnerPayment.findOne({id: id});
        if (!payment) {
            throw new BadRequestException('partner_payment_does_not_exists')
        }

        payment.isPaid = true;
        payment.paymentNumber = dto.payUextOrderId;
        payment.partnerPaymentAt = new Date();
        await payment.save();
    }

}
