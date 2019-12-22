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
import { ApiImplicitBody, ApiResponse } from "@nestjs/swagger";
import { PartnerPaymentResponse } from "../../../models/partner/response/partner-payment.response";

@Controller()
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
        if (payment) {
            const code = this.codeService.createCode(0, 99999) + '-' + this.codeService.createCode(0, 9999) + "-" + this.codeService.createCode(0, 99);
            return new PartnerPaymentResponse(period.to, payment, code)
        }
    }

    @Put(':id')
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiImplicitBody({name: '', type: {payUextOrderId: 'string'}})
    async updatePaymentInformation(@Req() req: any, @Param('id') id: string, dto: { payUextOrderId: string }) {
        let payment: PartnerPayment | undefined = await PartnerPayment.findOne({id: id});
        if (!payment) {
            throw new BadRequestException('partner_payment_does_not_exists')
        }

        payment.isPaid = true;
        payment.paymentNumber = dto.payUextOrderId;
        payment.partnerPaymentAt = new Date();
        payment.save();
    }

}