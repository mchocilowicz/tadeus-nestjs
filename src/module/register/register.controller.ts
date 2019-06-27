import { Body, Controller, Post, Put } from "@nestjs/common";
import { VerifyUserDto } from "../../dto/verifyUser.dto";
import { UserInformationDto } from "../../dto/userInformation.dto";
import { AuthService } from "../auth/auth.service";
import { RegisterPhoneDto } from "../../dto/registerPhone.dto";

@Controller()
export class RegisterController {
    constructor(private readonly service: AuthService) {
    }

    @Post('phone')
    registerPhone(@Body() phone: RegisterPhoneDto) {
        return this.service.createUser(phone);
    }

    @Post('code')
    checkCode(@Body() dto: VerifyUserDto) {
        this.service.checkCode(dto)
    }

    @Put('information')
    fillInformation(@Body() dto: UserInformationDto) {
        return this.service.fillUserInformation(dto)
    }
}
