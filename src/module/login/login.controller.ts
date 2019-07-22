import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LoginService } from "./login.service";
import { PhoneDto } from "../../dto/phone.dto";
import { VerifyUserDto } from "../../dto/verifyUser.dto";
import { ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { ResponseDto } from "../../dto/response.dto";
import { RoleEnum } from "../../common/enum/role.enum";

@Controller()
@ApiUseTags('login')
export class LoginController {
    constructor(private readonly service: LoginService) {
    }

    @Post('client')
    @HttpCode(200)
    @ApiResponse({status: 200, type: ResponseDto})
    async signIn(@Body() phone: PhoneDto) {
        await this.service.signIn(phone, RoleEnum.CLIENT);
    }

    @Post('dashboard')
    @HttpCode(200)
    @ApiResponse({status: 200, type: ResponseDto})
    async dashboardSignIn(@Body() phone: PhoneDto) {
        await this.service.signIn(phone, RoleEnum.ADMIN);
    }

    @Post('partner')
    @ApiResponse({status: 200, type: ResponseDto})
    async partnerSignIn(@Body() phone: PhoneDto) {
        await this.service.signIn(phone, RoleEnum.PARTNER);
    }

    @Post('code')
    @ApiResponse({status: 200, type: 'string'})
    verifyCode(@Body() dto: VerifyUserDto) {
        return this.service.checkVerificationCode(dto);
    }

    @Post('anonymous')
    @ApiResponse({status: 200, type: "string"})
    createAnonymous() {
        return this.service.createAnonymousUser();
    }
}
