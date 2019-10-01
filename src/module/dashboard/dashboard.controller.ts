import { Body, Controller, Get, HttpCode, Param, Post, Put } from "@nestjs/common";
import { ApiImplicitBody, ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { Const } from "../../common/util/const";
import { PhoneRequest } from "../../models/request/phone.request";
import { RoleEnum } from "../../common/enum/role.enum";
import { CodeVerificationRequest } from "../../models/request/code-verification.request";
import { LoginService } from "../common/login.service";
import { createQueryBuilder } from "typeorm";
import { DonationEnum } from "../../common/enum/donation.enum";
import { User } from "../../database/entity/user.entity";
import { TradingPoint } from "../../database/entity/trading-point.entity";
import { City } from "../../database/entity/city.entity";
import { TradingPointType } from "../../database/entity/trading-point-type.entity";

const moment = require("moment");

@Controller()
@ApiUseTags('dashboard/auth')
export class DashboardController {
    constructor(private readonly service: LoginService) {
    }

    @Post('signIn')
    @HttpCode(200)
    @ApiResponse({status: 200, type: null})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: PhoneRequest})
    async dashboardSignIn(@Body() phone: PhoneRequest) {
        await this.service.signIn(phone, RoleEnum.DASHBOARD);
    }

    @Post('code')
    @ApiResponse({status: 200, type: 'string', description: 'Authorization token'})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: CodeVerificationRequest})
    verifyCode(@Body() dto: CodeVerificationRequest) {
        return this.service.checkDashboardCode(dto);
    }

    @Get('/stats/user')
    async getUsersStats() {
        let users = await createQueryBuilder('User', 'user')
            .leftJoinAndSelect('user.roles', 'role')
            .where('role.name = :name', {name: RoleEnum.CLIENT}).getMany();

        return {
            registered: users.filter((user: any) => user.registered).length,
            today: users.filter((user: any) => moment(user.updatedDate).format(Const.DATE_FORMAT) === moment().format(Const.DATE_FORMAT)).length,
            week: users.filter((user: any) => moment(user.updatedDate).isBetween(moment().format(Const.DATE_FORMAT), moment().subtract(7, 'days').format(Const.DATE_FORMAT)
            )).length,
            month: users.filter((user: any) => moment(user.updatedDate).isBetween(moment().format(Const.DATE_FORMAT), moment().subtract(1, 'months').format(Const.DATE_FORMAT)
            )).length,
            overMonth: users.filter((user: any) => moment(user.updatedDate).isBetween(moment().subtract(2, 'months').format(Const.DATE_FORMAT), moment().subtract(3, 'months').format(Const.DATE_FORMAT)
            )).length,
            months: users.filter((user: any) => moment(user.updatedDate).isBetween(moment().subtract(3, 'months').format(Const.DATE_FORMAT), moment().subtract(999, 'months').format(Const.DATE_FORMAT)
            )).length,
        }
    }

    @Get('stats/ngo')
    async getNgoStats() {
        let donations = await createQueryBuilder('Donations', 'donations').getMany();
        let users = await User.find();
        return {
            overall: donations.reduce((o, e: any) => o + e.price, 0),
            personalPool: donations.filter((d: any) => d.pool === 'PERSONAL').reduce((o, e: any) => o + e.price, 0),
            donationPool: donations.filter((d: any) => d.pool === 'DONATION').reduce((o, e: any) => o + e.price, 0),
            ngo: donations.filter((d: any) => d.pool === 'DONATION' && d.type === DonationEnum.NGO).reduce((o, e: any) => o + e.price, 0),
            userPool: users.reduce((o, e: any) => o + e.personalPool, 0)
        }
    }

    @Get('stats/trading-point')
    async getPointStats() {
        let users = await TradingPoint.find();

        return {
            registered: users.filter((user: any) => user.registered).length,
            today: users.filter((user: any) => moment(user.updatedDate).format(Const.DATE_FORMAT) === moment().format(Const.DATE_FORMAT)).length,
            week: users.filter((user: any) => moment(user.updatedDate).isBetween(moment().format(Const.DATE_FORMAT), moment().subtract(7, 'days').format(Const.DATE_FORMAT)
            )).length,
            month: users.filter((user: any) => moment(user.updatedDate).isBetween(moment().format(Const.DATE_FORMAT), moment().subtract(1, 'months').format(Const.DATE_FORMAT)
            )).length,
            overMonth: users.filter((user: any) => moment(user.updatedDate).isBetween(moment().subtract(2, 'months').format(Const.DATE_FORMAT), moment().subtract(3, 'months').format(Const.DATE_FORMAT)
            )).length,
            months: users.filter((user: any) => moment(user.updatedDate).isBetween(moment().subtract(3, 'months').format(Const.DATE_FORMAT), moment().subtract(999, 'months').format(Const.DATE_FORMAT)
            )).length,
        }
    }

    @Get('city')
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    getCities() {
        return City.find();
    }

    @Post('city')
    async createCity(@Body() dto: any) {
        let city = new City();
        city.name = dto.name;
        return await city.save();
    }

    @Put('city/:id')
    async updateCity(@Param('id') id: string, @Body() dto: any) {
        let city = await City.findOne({id: id});
        city.name = dto.name;
        await city.save()
    }

    @Get('trading-point-type')
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    getAllTypes() {
        return TradingPointType.find();
    }

}
