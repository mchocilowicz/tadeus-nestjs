import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { LoginService } from "./login.service";
import { ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { RoleEnum } from "../../common/enum/role.enum";
import { TadeusValidationPipe } from "../../common/pipe/tadeus-validation.pipe";
import { Const } from "../../common/util/const";
import { PhoneRequest } from "../../models/request/phone.request";
import { CodeVerificationRequest } from "../../models/request/code-verification.request";

@Controller()
@ApiUseTags('login')
export class LoginController {
    constructor(private readonly service: LoginService) {
    }

    @Post('client')
    @HttpCode(200)
    @ApiResponse({status: 200, type: null})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @UsePipes(TadeusValidationPipe)
    async signIn(@Body() phone: PhoneRequest) {
        await this.service.signIn(phone, RoleEnum.CLIENT);
    }

    @Post('dashboard')
    @HttpCode(200)
    @ApiResponse({status: 200, type: null})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @UsePipes(TadeusValidationPipe)
    async dashboardSignIn(@Body() phone: PhoneRequest) {
        await this.service.signIn(phone, RoleEnum.ADMIN);
    }

    @Post('partner')
    @ApiResponse({status: 200, type: null})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @UsePipes(TadeusValidationPipe)
    async partnerSignIn(@Body() phone: null) {
        await this.service.signIn(phone, RoleEnum.PARTNER);
    }

    @Post('code')
    @ApiResponse({status: 200, type: 'string', description: 'Authorization token'})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    verifyCode(@Body() dto: CodeVerificationRequest) {
        return this.service.checkVerificationCode(dto);
    }

    @Post('anonymous')
    @ApiResponse({status: 200, type: "string", description: 'Authorization Token'})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    createAnonymous() {
        return this.service.createAnonymousUser();
    }
}
