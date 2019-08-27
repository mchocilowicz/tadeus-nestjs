import { Body, Controller, Post } from "@nestjs/common";
import { ApiImplicitBody, ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { Const } from "../../common/util/const";
import { CodeVerificationRequest } from "../../models/request/code-verification.request";
import { PhoneRequest } from "../../models/request/phone.request";
import { RoleEnum } from "../../common/enum/role.enum";
import { LoginService } from "../common/login.service";

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
}
