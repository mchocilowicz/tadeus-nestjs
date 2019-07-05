import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from "./auth.service";
import { PhoneDto } from "../../dto/phone.dto";
import { VerifyUserDto } from "../../dto/verifyUser.dto";
import { ApiResponse, ApiUseTags } from "@nestjs/swagger";

@Controller()
export class AuthController {
    constructor(private readonly service: AuthService) {
    }

    @Post('phone')
    @ApiUseTags('auth')
    signIn(@Body() phone: PhoneDto): Promise<void> {
        return this.service.signIn(phone);
    }

    @Post('code')
    @ApiUseTags('auth')
    @ApiResponse({status: 200, type: "string"})
    verifyCode(@Body() dto: VerifyUserDto): Promise<string> {
        return this.service.checkVerificationCode(dto)
    }

    @Post('anonymous')
    @ApiUseTags('auth')
    @ApiResponse({status: 200, type: "string"})
    createAnonymous(): Promise<string> {
        return this.service.createAnonymousUser();
    }
}
