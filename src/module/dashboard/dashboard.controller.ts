import {Body, Controller, Get, HttpCode, NotFoundException, Param, Post, Put, Res, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiBody, ApiHeader, ApiResponse, ApiTags} from "@nestjs/swagger";
import {Const} from "../../common/util/const";
import {PhoneRequest} from "../../models/common/request/phone.request";
import {CodeVerificationRequest} from "../../models/common/request/code-verification.request";
import {LoginService} from "../common/login.service";
import {City} from "../../database/entity/city.entity";
import {TradingPointType} from "../../database/entity/trading-point-type.entity";
import {Roles} from "../../common/decorators/roles.decorator";
import {RoleEnum} from "../../common/enum/role.enum";
import {JwtAuthGuard} from "../../common/guards/jwt.guard";
import {RolesGuard} from "../../common/guards/roles.guard";

@Controller()
@ApiTags('auth')
export class DashboardController {

    constructor(private readonly service: LoginService) {
    }

    @Post('signIn')
    @HttpCode(200)
    @ApiResponse({status: 200})
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    @ApiBody({type: PhoneRequest})
    async dashboardSignIn(@Body() phone: PhoneRequest) {
        await this.service.signInDashboard(phone);
    }

    @Post('code')
    @ApiResponse({status: 200, type: 'string', description: 'Authorization token'})
    @ApiBody({type: CodeVerificationRequest})
    verifyCode(@Body() dto: CodeVerificationRequest) {
        return this.service.checkCodeForDashboard(dto);
    }

    @Get('city')
    getCities() {
        return City.find();
    }

    @Post('city')
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async createCity(@Body() dto: any) {
        let city = new City(dto.name);
        return await city.save();
    }

    @Put('city/:id')
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async updateCity(@Param('id') id: string, @Body() dto: any) {
        let city = await City.findOne({id: id});
        if (!city) {
            throw new NotFoundException('city_not_exists')
        }

        city.name = dto.name;
        await city.save();
    }

    @Get('trading-point-type')
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    getAllTypes() {
        return TradingPointType.find();
    }

    @Get('/img/:imageName')
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    @ApiResponse({status: 200, type: "File", description: "Image"})
    getImage(@Param('imageName') imageName: string, @Res() res: any) {
        res.sendFile(imageName, {root: 'public/image'});
    }
}
