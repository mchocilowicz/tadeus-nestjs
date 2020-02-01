import {ApiBody, ApiHeader, ApiResponse, ApiTags} from "@nestjs/swagger";
import {RegisterService} from "./register.service";
import {Body, Controller, HttpCode, Post, Put} from "@nestjs/common";
import {Const} from "../../../common/util/const";
import {CodeVerificationRequest} from "../../../models/common/request/code-verification.request";
import {UserInformationRequest} from "../../../models/common/request/user-Information.request";
import {LoginService} from "../../common/login.service";

@Controller()
@ApiTags('register')
@ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
export class RegisterController {
    constructor(private readonly service: RegisterService, private readonly loginService: LoginService) {
    }

    @Post('code')
    @HttpCode(200)
    @ApiResponse({status: 200})
    @ApiBody({type: CodeVerificationRequest})
    async checkCode(@Body() dto: CodeVerificationRequest) {
        await this.service.checkCode(dto);
    }

    @Put('information')
    @HttpCode(200)
    @ApiResponse({status: 200, type: "string", description: "Authorization token"})
    @ApiBody({type: UserInformationRequest})
    async fillInformation(@Body() dto: UserInformationRequest) {
        return await this.service.fillUserInformation(dto);
    }
}
