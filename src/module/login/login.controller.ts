import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LoginService } from "./login.service";
import { ApiImplicitBody, ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { RoleEnum } from "../../common/enum/role.enum";
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
    @ApiImplicitBody({name: '', type: PhoneRequest})
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
    @ApiImplicitBody({name: '', type: PhoneRequest})
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
    @ApiImplicitBody({name: '', type: PhoneRequest})
    async partnerSignIn(@Body() phone: PhoneRequest) {
        await this.service.signIn(phone, RoleEnum.PARTNER);
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
}
