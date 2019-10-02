import { ApiImplicitBody, ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { RegisterService } from "./register.service";
import { Body, Controller, HttpCode, Post, Put } from "@nestjs/common";
import { Const } from "../../../common/util/const";
import { NewPhoneRequest } from "../../../models/request/new-phone.request";
import { CodeVerificationRequest } from "../../../models/request/code-verification.request";
import { UserInformationRequest } from "../../../models/request/user-Information.request";
import { LoginService } from "../../common/login.service";

const axios = require('axios');

@Controller()
@ApiUseTags('client/register')
export class RegisterController {
    constructor(private readonly service: RegisterService, private readonly loginService: LoginService) {
    }

    @Post('phone')
    @HttpCode(200)
    @ApiResponse({status: 200, type: null})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: NewPhoneRequest})
    async registerPhone(@Body() phone: NewPhoneRequest) {
        return await this.loginService.clientSignIn(phone);
    }

    @Post('code')
    @HttpCode(200)
    @ApiResponse({status: 200, type: null})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: CodeVerificationRequest})
    async checkCode(@Body() dto: CodeVerificationRequest) {
        await this.service.checkCode(dto);
    }

    @Put('information')
    @HttpCode(200)
    @ApiResponse({status: 200, type: "string", description: "Authorization token"})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: UserInformationRequest})
    async fillInformation(@Body() dto: UserInformationRequest) {
        return await this.service.fillUserInformation(dto);
    }
}
