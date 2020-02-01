import {Controller, Get, Req, UseGuards} from "@nestjs/common";
import {Terminal} from "../../../database/entity/terminal.entity";
import {TradingPoint} from "../../../database/entity/trading-point.entity";
import {PartnerPayment} from "../../../database/entity/partner-payment.entity";
import {CodeService} from "../../../common/service/code.service";
import {Roles} from "../../../common/decorators/roles.decorator";
import {RoleEnum} from "../../../common/enum/role.enum";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";
import {ApiBearerAuth, ApiHeader, ApiResponse, ApiTags} from "@nestjs/swagger";
import {PartnerPaymentResponse} from "../../../models/partner/response/partner-payment.response";
import {Const} from "../../../common/util/const";

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

        let payments: PartnerPayment[] = await PartnerPayment.findAllNotPaidPayments(point.id);

        let hasPayments: boolean = payments.length > 0;
        const paymentPrice: number = payments.reduce((p, c) => p + c.price, 0);
        let paymentAt = undefined;
        if (hasPayments) {
            paymentAt = payments[0].paymentAt
        }

        let code = this.codeService.createCode(0, 99999) + '-' + this.codeService.createCode(0, 9999) + "-" + this.codeService.createCode(0, 99);

        return new PartnerPaymentResponse(paymentPrice, code, hasPayments, paymentAt)
    }

    // @Put()
    // @Roles(RoleEnum.TERMINAL)
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @ApiBody({type: DonationRequest})
    // async updatePaymentInformation(@Req() req: any, @Body() dto: DonationRequest) {
    //     let payment: PartnerPayment | undefined = await PartnerPayment.findOne({id: dto.paymentId});
    //     if (!payment) {
    //         throw new BadRequestException('partner_payment_does_not_exists')
    //     }
    //
    //     if (payment.isPaid) {
    //         throw new BadRequestException('partner_payment_payed')
    //     }
    //
    //     if (payment.paymentDetails) {
    //         payment.paymentDetails += "," + dto.payUextOrderId;
    //     } else {
    //         payment.paymentDetails = dto.payUextOrderId;
    //     }
    //     await payment.save();
    // }

}
