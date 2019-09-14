import { Body, Controller, Delete, Get, Logger, Param, Post, Put, UploadedFile, UseInterceptors } from "@nestjs/common";
import { TradingPoint } from "../../../database/entity/trading-point.entity";
import { createQueryBuilder, QueryFailedError } from "typeorm";
import { FileInterceptor } from "@nestjs/platform-express";
import { City } from "../../../database/entity/city.entity";
import { TradingPointType } from "../../../database/entity/trading-point-type.entity";
import { User } from "../../../database/entity/user.entity";
import { Role } from "../../../database/entity/role.entity";
import { RoleEnum } from "../../../common/enum/role.enum";
import { ApiConsumes, ApiImplicitBody, ApiImplicitFile, ApiImplicitHeader, ApiUseTags } from "@nestjs/swagger";
import { validate } from "class-validator";
import { extractErrors, handleException } from "../../../common/util/functions";
import { ExcelException } from "../../../common/exceptions/excel.exception";
import TradingPointExcelRow from "../../../models/excel/trading-point-row.excel";
import { Const } from "../../../common/util/const";
import { TradingPointTypeRequest } from "../../../models/request/trading-point-type.request";
import { CodeService } from "../../../common/service/code.service";
import { Account } from "../../../database/entity/account.entity";
import { Terminal } from "../../../database/entity/terminal.entity";

@Controller()
@ApiUseTags('dashboard/trading-point')
export class TradingPointController {
    private readonly logger = new Logger(TradingPointController.name);

    constructor(private readonly codeService: CodeService) {
    }

    @Delete(':tradePointId')
    deleteTradePoint() {
    }

    @Post()
    async createTradePoint(@Body() dto: any) {
        const point = new TradingPoint();
        this.mapToBaseEntity(dto, point);
        point.ID = this.codeService.generateTradingPointNumber(dto.type.code);
        await point.save()
    }

    @Get()
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
                donationPercentage: t.donationPercentage,
                defaultVat: t.vat,
                manipulationFee: t.manipulationFee,
                city: t.city,
                xp: t.xp,
                updatedDate: t.updatedDate
            }
        })
    }

    @Post("upload")
    @ApiConsumes('multipart/form-data')
    @ApiImplicitFile({name: 'file', required: true, description: 'XLSX file with TradingPoint definitions'})
    @UseInterceptors(FileInterceptor('file'))
    async uploadTradingPointsWithFile(@UploadedFile() file) {
        console.log(file);
        const xlsx = require('xlsx');
        const workbook = xlsx.readFile(file.path);
        const sheetNames = workbook.SheetNames;
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
        const errors = [];
        this.logger.log("Started to process excel file with trading-points");
        if (sheetData.constructor.name !== 'Array') {
            await this.saveTradingPointRow(sheetData, 1, errors)
        } else {
            this.logger.log("Parsing excel data count: " + sheetData.length);
            for (let i = 0; i < sheetData.length; i++) {
                await this.saveTradingPointRow(sheetData[i], i, errors)
            }
        }
        this.logger.log("Ended to process excel file with trading-points");
    }

    @Get(':id')
    async getTradePointById(@Param('id') id: string) {
        return await TradingPoint.findOne({id: id}, {relations: ['city', 'type', 'user', 'transactions']})
    }

    @Put(':tradePointId')
    async updateTradingPoint(@Body() dto: any) {
        let point = await TradingPoint.findOne({id: dto.id});
        this.mapToBaseEntity(dto, point);
        await point.save()
    }

    @Post(':tradingPointId/terminal')
    async assignNewTerminal(@Param('tradingPointId') id: string, @Body() dto: any) {
        let point = await TradingPoint.findOne({id: id});
        let user = await User.findOne({phone: dto.phone}, {relations: ['terminal']});
        const role = await Role.findOne({name: RoleEnum.TERMINAL});
        if (!user) {
            user = new User();
            let account = new Account();
            account.role = role;
            let counts = await Terminal.count({tradingPoint: point});
            account.ID = [point.ID, this.codeService.generateTerminalNumber(counts)].join('-');
            let terminal = new Terminal();
            terminal.tradingPoint = point;

            user.terminal = await terminal.save();
            user = await user.save();
            account.user = user;
            await account.save()
        } else {
            let terminal = new Terminal();
            terminal.tradingPoint = point;
            user.terminal = await terminal.save();
            let account = new Account();
            account.role = role;
            let counts = await Terminal.count({tradingPoint: point});
            account.ID = [point.ID, this.codeService.generateTerminalNumber(counts)].join('-');
            user = await user.save();
            account.user = user;
            await account.save();
        }
    }

    @Post('type')
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: TradingPointTypeRequest})
    async savePlaceType(@Body() dto: TradingPointTypeRequest) {
        const type = new TradingPointType();
        type.name = dto.name;
        type.code = await this.getTypeCode();
        try {
            await type.save();
        } catch (e) {
            handleException(e, 'ngo_type', this.logger)
        }
    }

    @Put('type/:id')
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    async updateType(@Param('id') id: string, @Body() dto: any) {
        const type = await TradingPointType.findOne({id: id});
        type.name = dto.name;
        await type.save()
    }

    @Get('report')
    async getReport() {
        let cart = await createQueryBuilder('Cart', 'cart')
            .leftJoinAndSelect('cart.tradingPoint', 'tradingPoint')
            .orderBy('tradingPoint', 'DESC')
            .getMany();

        return {
            carts: cart,
            availableMoney: cart.filter((c: any) => c.isPaid == true).reduce((t, e: any) => t + e.price, 0),
            unavailableMoney: cart.filter((c: any) => c.isPaid == false).reduce((t, e: any) => t + e.price, 0),
        };
    }

    private mapToBaseEntity(dto: any, entity: TradingPoint): void {
        entity.city = dto.city;
        entity.type = dto.type;
        entity.name = dto.name;
        entity.address = dto.address;
        entity.donationPercentage = dto.donationPercentage;
        entity.vat = dto.vat;
        entity.longitude = dto.longitude;
        entity.latitude = dto.latitude;
        entity.manipulationFee = dto.manipulationFee;
        entity.postCode = dto.postCode;
        entity.xp = dto.xp;
    }

    private async saveTradingPointRow(excelRow, index: number, errors: object[]) {
        const row: TradingPointExcelRow = this.mapRowColumns(excelRow);
        let validationErrors = await validate(row);
        if (validationErrors.length > 0) {
            let code = extractErrors(validationErrors);
            throw new ExcelException({row: index, message: code});
        }
        let tradePoint: TradingPoint = new TradingPoint();
        tradePoint.name = row.name;
        tradePoint.donationPercentage = row.donationPercentage;
        tradePoint.vat = row.vat;
        tradePoint.manipulationFee = row.manipulationFee ? row.manipulationFee : 0.66;
        tradePoint.latitude = row.latitude;
        tradePoint.longitude = row.longitude;
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
            type = new TradingPointType();
            type.name = row.type;
            type.code = await this.getTypeCode();
            type = await type.save()
        }

        tradePoint.city = city;
        tradePoint.type = type;
        tradePoint.ID = this.codeService.generateTradingPointNumber(type.code);
        try {
            await tradePoint.save();
        } catch (e) {
            console.log(e);
            if (e instanceof QueryFailedError) {
                let error: any = e;
                if (error.code === '23505') {
                    errors.push({row: index, message: 'excel_trading_point_name'})
                }
            } else {
                throw e;
            }
        }

    }

    private mapRowColumns(row) {
        const columnMapping = {
            'Name': 'name',
            'Type': 'type',
            'Donation Percentage': 'donationPercentage',
            'Vat': 'vat',
            'Manipulation fee': 'manipulationFee',
            'Latitude': 'latitude',
            'Longitude': 'longitude',
            'Address': 'address',
            'Post code': 'postCode',
            'Xp': 'xp',
            'City': 'city',
        };
        const newRow = {};
        Object.keys(columnMapping).forEach(key => newRow[columnMapping[key]] = row[key]);
        return new TradingPointExcelRow(newRow);
    }

    private async getTypeCode(): Promise<number> {
        let code = null;
        while (!code) {
            const a = this.createCode(100, 1000);
            const b = await TradingPointType.findOne({code: a});
            if (!b) {
                code = a;
            }
        }
        return code
    }

    private createCode(min: number, max: number) {
        return Math.floor(Math.random() * (max - min) + min);
    }
}
