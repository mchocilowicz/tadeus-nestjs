import { BadRequestException, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { Terminal } from "../../../database/entity/terminal.entity";
import { TradingPoint } from "../../../database/entity/trading-point.entity";
import { Period } from "../../../database/entity/period.entity";
import { PartnerPayment } from "../../../database/entity/partner-payment.entity";
import { CodeService } from "../../../common/service/code.service";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleEnum } from "../../../common/enum/role.enum";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";

@Controller()
export class PartnerDonationController {

    constructor(private readonly codeService: CodeService) {
    }

    @Get()
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getPaymentInformation(@Req() req: any) {
        let terminal: Terminal = req.user;
        let point: TradingPoint = terminal.tradingPoint;

        let period = await Period.findCurrentPartnerPeriod();
        if (!period) {
            throw new BadRequestException('')
        }

        let payment: PartnerPayment | undefined = await PartnerPayment.findOne({period: period, tradingPoint: point});
        if (payment) {
            return {
                price: payment.price,
                date: period.to,
                code: this.codeService.createCode(0, 99999) + '-' + this.codeService.createCode(0, 9999) + "-" + this.codeService.createCode(0, 99)
            }
        }
    }

    @Post()
    @Roles(RoleEnum.TERMINAL)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updatePaymentInformation(@Req() req: any) {

    }

}