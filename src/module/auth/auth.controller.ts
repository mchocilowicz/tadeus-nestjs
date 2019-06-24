import {Body, Controller, Post} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {PhoneDto} from "../../dto/phone.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly service: AuthService) {
    }

    @Post('signIn')
    signIn(@Body() phone: any): Promise<void> {
        return this.service.signIn(phone);
    }

    @Post('phone')
    registerPhone(@Body() phone: PhoneDto): Promise<void> {
        return this.service.createUser(phone);
    }

    @Post('information')
    fillInformation(@Body() dto: any): Promise<string> {
        return this.service.fillUserInformation(dto)
    }

    @Post('code')
    verifyCode(@Body() dto: any): Promise<void> {
        return this.service.checkVerificationCode(dto)
    }

    @Post('anonymous')
    anonymous(): Promise<string> {
        return this.service.createAnonymousUser();
    }
}
