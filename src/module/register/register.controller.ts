import { VerifyUserDto } from "../../dto/verifyUser.dto";
import { UserInformationDto } from "../../dto/userInformation.dto";
import { RegisterPhoneDto } from "../../dto/registerPhone.dto";
import { ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
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
    @ApiImplicitHeader({
        name: 'Accept-Language',
        required: true,
        description: 'Language of returned Error message. [pl,eng]'
    })
    async registerPhone(@Body() phone: RegisterPhoneDto) {
        await this.service.createUser(phone);
    }

    @Post('code')
    @HttpCode(200)
    @ApiResponse({status: 200, type: ResponseDto})
    @ApiImplicitHeader({
        name: 'Accept-Language',
        required: true,
        description: 'Language of returned Error message. [pl,eng]'
    })
    async checkCode(@Body() dto: VerifyUserDto) {
        await this.service.checkCode(dto);
    }

    @Put('information')
    @HttpCode(200)
    @ApiResponse({status: 200, type: ResponseDto})
    @ApiImplicitHeader({
        name: 'Accept-Language',
        required: true,
        description: 'Language of returned Error message. [pl,eng]'
    })
    async fillInformation(@Body() dto: UserInformationDto) {
        return await this.service.fillUserInformation(dto);
    }
}
