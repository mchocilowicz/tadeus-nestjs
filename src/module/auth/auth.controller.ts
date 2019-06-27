import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from "./auth.service";
import { PhoneDto } from "../../dto/phone.dto";
import { VerifyUserDto } from "../../dto/verifyUser.dto";

@Controller()
export class AuthController {
    constructor(private readonly service: AuthService) {
    }

    @Post('phone')
    signIn(@Body() phone: PhoneDto): Promise<void> {
        return this.service.signIn(phone);
    }

    @Post('code')
    verifyCode(@Body() dto: VerifyUserDto): Promise<string> {
        return this.service.checkVerificationCode(dto)
    }

    @Post('anonymous')
    createAnonymous(): Promise<string> {
        return this.service.createAnonymousUser();
    }
}
