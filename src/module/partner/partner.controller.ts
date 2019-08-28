import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiImplicitBody, ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { Const } from "../../common/util/const";
import { CodeVerificationRequest } from "../../models/request/code-verification.request";
import { PhoneRequest } from "../../models/request/phone.request";
import { RoleEnum } from "../../common/enum/role.enum";
import { LoginService } from "../common/login.service";
import { User } from "../../database/entity/user.entity";
import { createQueryBuilder } from "typeorm";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { PartnerDetailsResponse } from "../../models/response/partner-details.response";

@Controller()
@ApiUseTags('partner/auth',)
export class PartnerController {
    constructor(private readonly service: LoginService) {
    }

    @Post('code')
    @ApiResponse({status: 200, type: 'string', description: 'Authorization token'})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: CodeVerificationRequest})
    verifyCode(@Body() dto: CodeVerificationRequest) {
        return this.service.checkVerificationCode(dto);
    }

    @Post('signIn')
    @ApiResponse({status: 200, type: null})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: PhoneRequest})
    async partnerSignIn(@Body() phone: PhoneRequest) {
        await this.service.signIn(phone, RoleEnum.TERMINAL);
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
    @ApiBearerAuth()
    @ApiResponse({status: 200, type: PartnerDetailsResponse})
    async getPartnerData(@Req() req: any) {
        const user: User = req.user;
        const partner: any = await createQueryBuilder('TradingPoint')
            .leftJoinAndSelect('TradingPoint.city', 'city')
            .where('TradingPoint.id = :id', {id: user.tradingPoint.id})
            .andWhere('TradingPoint.active = true')
            .getOne();

        return {
            id: user.terminalID,
            name: partner.name,
            city: partner.city.name,
            address: partner.address,
            postCode: partner.postCode,
            xp: partner.xp
        }
    }
}
