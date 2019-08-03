import { VerifyUserDto } from "../../dto/verifyUser.dto";
import { UserInformationDto } from "../../dto/userInformation.dto";
import { RegisterPhoneDto } from "../../dto/registerPhone.dto";
import { ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { ResponseDto } from "../../dto/response.dto";
import { RegisterService } from "./register.service";
import { Body, Controller, HttpCode, Post, Put } from "@nestjs/common";

@Controller()
@ApiUseTags('register')
export class RegisterController {
    constructor(private readonly service: RegisterService) {
    }

    @Post('phone')
    @HttpCode(200)
    @ApiResponse({status: 200, type: ResponseDto})
    async registerPhone(@Body() phone: RegisterPhoneDto) {
        await this.service.createUser(phone);
    }

    @Post('code')
    @HttpCode(200)
    @ApiResponse({status: 200, type: ResponseDto})
    async checkCode(@Body() dto: VerifyUserDto) {
        await this.service.checkCode(dto);
    }

    @Put('information')
    @HttpCode(200)
    @ApiResponse({status: 200, type: ResponseDto})
    async fillInformation(@Body() dto: UserInformationDto) {
        return await this.service.fillUserInformation(dto);
    }
}
