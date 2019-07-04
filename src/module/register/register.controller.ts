import { Body, Controller, Post, Put } from "@nestjs/common";
import { VerifyUserDto } from "../../dto/verifyUser.dto";
import { UserInformationDto } from "../../dto/userInformation.dto";
import { AuthService } from "../auth/auth.service";
import { RegisterPhoneDto } from "../../dto/registerPhone.dto";
import { ApiUseTags } from "@nestjs/swagger";

@Controller()
export class RegisterController {
    constructor(private readonly service: AuthService) {
    }

    @Post('phone')
    @ApiUseTags('register')
    registerPhone(@Body() phone: RegisterPhoneDto) {
        return this.service.createUser(phone);
    }

    @Post('code')
    @ApiUseTags('register')
    checkCode(@Body() dto: VerifyUserDto) {
        this.service.checkCode(dto)
    }

    @Put('information')
    @ApiUseTags('register')
    fillInformation(@Body() dto: UserInformationDto) {
        this.service.fillUserInformation(dto)
    }
}
