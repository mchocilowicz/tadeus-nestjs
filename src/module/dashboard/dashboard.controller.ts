import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UploadedFile,
    UseInterceptors
} from "@nestjs/common";
import { User } from "../../database/entity/user.entity";
import { createQueryBuilder } from "typeorm";
import { RoleEnum } from "../../common/enum/role.enum";
import { Status } from "../../common/enum/status.enum";
import { TradingPoint } from "../../database/entity/trading-point.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { City } from "../../database/entity/city.entity";
import { TradingPointType } from "../../database/entity/trading-point-type.entity";
import { Role } from "../../database/entity/role.entity";

const xlsx = require('xlsx');

@Controller()
export class DashboardController {

    @Get('user')
    async getAllUsers() {
        const users = await createQueryBuilder("User")
            .innerJoin("User.roles", 'role', "role.name = :name", {name: RoleEnum.CLIENT})
            .getMany();
        return users.map((user: User) => {
            return {
                id: user.id,
                phone: user.phone,
                name: user.name,
                email: user.email,
                xp: user.xp,
                status: user.status,
                updatedDate: user.updatedDate
            }
        })
    }

    @Get('user/:id')
    async getUserById(@Param('id') id: string) {
        let user = await User.findOne({id: id}, {relations: ['ngo', 'transactions', 'donations']});
        if (!user) {
            throw new BadRequestException('Uzytkownik nie istenieje')
        }
        return user;
    }

    @Put('user/:id')
    async updateUserPhone(@Param('id') id: string, @Body() dto: { phone: string }) {
        let user = await User.findOne({id: id});
        if (!user) {
            throw new BadRequestException('Uzytkownik nie istenieje')
        }
        user.phone = dto.phone;
        await user.save();
    }

    @Put('user/:id/status')
    async updateUserStatus(@Param('id') id: string, @Body() dto: { status: Status }) {
        let user = await User.findOne({id: id});
        if (!user) {
            throw new BadRequestException('Uzytkownik nie istenieje')
        }
        user.status = dto.status;
        await user.save();
    }

    @Delete('trading-point/:tradePointId')
    deleteTradePoint() {
    }

    @Post('trading-point')
    async createTradePoint(@Body() dto: any) {
        const point = new TradingPoint();
        point.city = dto.city;
        point.type = dto.type;
        point.name = dto.name;
        point.address = dto.address;
        point.defaultDonationPercentage = dto.defaultDonationPercentage;
        point.defaultVat = dto.defaultVat;
        point.location = dto.location;
        point.manipulationFee = dto.manipulationFee;
        point.postCode = dto.postCode;
        point.xp = dto.xp;
        await point.save()
    }

    @Get('trading-point')
    async getAllTradePoints() {
        const tradePoints = await createQueryBuilder('TradingPoint')
            .leftJoinAndSelect('TradingPoint.city', 'city')
            .leftJoinAndSelect('TradingPoint.type', 'placeType')
            .getMany();
        return tradePoints.map((t: TradingPoint) => {
            return {
                id: t.id,
                type: t.type,
                name: t.name,
                defaultDonationPercentage: t.defaultDonationPercentage,
                defaultVat: t.defaultVat,
                manipulationFee: t.manipulationFee,
                city: t.city,
                xp: t.xp,
                updatedDate: t.updatedDate
            }
        })
    }

    @Post("trading-point/upload")
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file) {
        const workbook = xlsx.readFile(file.path);
        const sheetNames = workbook.SheetNames;
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
        const errors = [];
        if (sheetData.constructor.name !== 'Array') {
            await this.saveTradingPointRow(sheetData, errors)
        } else {
            sheetData.forEach(async (row, index) => {
                await this.saveTradingPointRow(row, errors)
            })
        }
    }

    private async saveTradingPointRow(row, error: string[]) {
        let tradePoint: TradingPoint = new TradingPoint();
        tradePoint.name = row.name;
        tradePoint.defaultDonationPercentage = row.donationPercentage;
        tradePoint.defaultVat = row.vat;
        tradePoint.manipulationFee = row.manipulationFee;
        tradePoint.location = row.location;
        tradePoint.address = row.address;
        tradePoint.postCode = row.postCode;
        tradePoint.xp = row.xp;

        let city = await City.findOne({name: row.city});
        if (!city) {
            let c = new City();
            c.name = row.city;
            city = await c.save()
        }
        let type = await TradingPointType.findOne({name: row.type});
        if (!type) {
            let t = new TradingPointType();
            t.name = row.type;
            type = await t.save()
        }

        tradePoint.city = city;
        tradePoint.type = type;
        await tradePoint.save();
    }

    @Get('trading-point/:id')
    async getTradePointById(@Param('id') id: string) {
        return await TradingPoint.findOne({id: id}, {relations: ['city', 'type', 'user', 'transactions']})
    }

    @Put('trading-point/:tradePointId')
    async updateTradingPoint(@Body() dto: TradingPoint) {
        let point = await TradingPoint.findOne({id: dto.id});
        point.type = dto.type;
        point.city = dto.city;
        point.xp = dto.xp;
        point.postCode = dto.postCode;
        point.address = dto.address;
        point.location = dto.location;
        point.manipulationFee = dto.manipulationFee;
        point.defaultVat = dto.defaultVat;
        point.defaultDonationPercentage = dto.defaultDonationPercentage;
        point.name = dto.name;
        await point.save()
    }

    @Post('trading-point/:tradingPointId/terminal')
    async assignNewTerminal(@Param('tradingPointId') id: string, @Body() dto: any) {
        let point = await TradingPoint.findOne({id: id});
        let user = await User.findOne({phone: dto.phone});
        const role = await Role.findOne({name: RoleEnum.PARTNER});
        if (user) {
            user.tradingPoint = point;
            user.roles.push(role);
        } else {
            user = new User();
            user.tradingPoint = point;
            user.phone = dto.phone;
            user.roles = [role];
        }
        await user.save();
    }
}
