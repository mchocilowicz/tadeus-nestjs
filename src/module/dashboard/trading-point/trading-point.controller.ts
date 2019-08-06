import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseInterceptors } from "@nestjs/common";
import { TradingPoint } from "../../../database/entity/trading-point.entity";
import { createQueryBuilder } from "typeorm";
import { FileInterceptor } from "@nestjs/platform-express";
import { City } from "../../../database/entity/city.entity";
import { TradingPointType } from "../../../database/entity/trading-point-type.entity";
import { User } from "../../../database/entity/user.entity";
import { Role } from "../../../database/entity/role.entity";
import { RoleEnum } from "../../../common/enum/role.enum";
import { ApiUseTags } from "@nestjs/swagger";

const xlsx = require('xlsx');

@Controller()
@ApiUseTags('dashboard/trading-point')
export class TradingPointController {
    @Delete('trading-point/:tradePointId')
    deleteTradePoint() {
    }

    @Post('trading-point')
    async createTradePoint(@Body() dto: any) {
        const point = new TradingPoint();
        this.mapToBaseEntity(dto, point);
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
    async updateTradingPoint(@Body() dto: any) {
        let point = await TradingPoint.findOne({id: dto.id});
        this.mapToBaseEntity(dto, point);
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

    mapToBaseEntity(dto: any, entity: TradingPoint): void {
        entity.city = dto.city;
        entity.type = dto.type;
        entity.name = dto.name;
        entity.address = dto.address;
        entity.defaultDonationPercentage = dto.defaultDonationPercentage;
        entity.defaultVat = dto.defaultVat;
        entity.location = dto.location;
        entity.manipulationFee = dto.manipulationFee;
        entity.postCode = dto.postCode;
        entity.xp = dto.xp;
    }
}
