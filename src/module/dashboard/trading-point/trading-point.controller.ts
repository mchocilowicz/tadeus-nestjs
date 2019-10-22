import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    Post,
    Put,
    Query,
    Res,
    UploadedFile,
    UseInterceptors
} from "@nestjs/common";
import { TradingPoint } from "../../../database/entity/trading-point.entity";
import { createQueryBuilder, getConnection, QueryFailedError } from "typeorm";
import { FileInterceptor } from "@nestjs/platform-express";
import { City } from "../../../database/entity/city.entity";
import { TradingPointType } from "../../../database/entity/trading-point-type.entity";
import { User } from "../../../database/entity/user.entity";
import { Role } from "../../../database/entity/role.entity";
import { RoleEnum } from "../../../common/enum/role.enum";
import { ApiConsumes, ApiImplicitFile, ApiUseTags } from "@nestjs/swagger";
import { validate } from "class-validator";
import { extractErrors } from "../../../common/util/functions";
import { ExcelException } from "../../../common/exceptions/excel.exception";
import { CodeService } from "../../../common/service/code.service";
import { Account } from "../../../database/entity/account.entity";
import { Terminal } from "../../../database/entity/terminal.entity";
import { diskStorage } from "multer";
import { TradingPointExcelRow } from "../../../models/excel/trading-point-row.excel";

const moment = require("moment");


@Controller()
@ApiUseTags('trading-point')
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
    async getAllTradePoints(@Query() query: { name: string, type: string, city: string }) {
        let sql = await createQueryBuilder('TradingPoint', 'tradingPoint')
            .leftJoinAndSelect('tradingPoint.city', 'city')
            .leftJoinAndSelect('tradingPoint.type', 'type');

        if (query.name) {
            sql = sql.andWhere('tradingPoint.name like "%:name"', {name: query.name})
        }
        if (query.type) {
            sql = sql.andWhere('type.name = :type', {type: query.type})
        }
        if (query.city) {
            sql = sql.andWhere('city.name = :city', {city: query.city})
        }
        let tradingPoints = await sql.getMany();

        return tradingPoints.map((t: TradingPoint) => {
            return {
                ID: t.ID,
                type: t.type,
                name: t.name,
                donation: t.donationPercentage,
                vat: t.vat,
                fee: t.fee,
                city: t.city,
                xp: t.xp,
                updatedDate: t.updatedAt
            }
        })
    }

    @Post("import")
    @ApiConsumes('multipart/form-data')
    @ApiImplicitFile({name: 'file', required: true, description: 'XLSX file with TradingPoint definitions'})
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination(req, file, cb) {
                cb(null, 'public/import');
            },
            filename: (req, file, cb) => {
                const newFileName = moment().format("YYYYMMDDHHmmss");

                return cb(null, `${newFileName}_${file.originalname}`)
            }
        })
    }))
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

    @Put(':id')
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination(req, file, cb) {
                cb(null, 'public/image');
            },
            filename(req, file, cb) {
                cb(null, Date.now() + '-' + file.originalname);
            },
        }),
    }))
    async updateTradingPoint(@UploadedFile() image, @Body() dto: any, @Param('id') id: string) {
        let point = await TradingPoint.findOne({ID: id}, {relations: ['city', 'type']});
        this.mapToBaseEntity(dto, point);
        await point.save()
    }

    @Get(':ID/terminal')
    getTerminal(@Param('ID') id: string) {
        return createQueryBuilder('Terminal', 'terminal')
            .leftJoin('terminal.tradingPoint', 'tradingPoint')
            .where('tradingPoint.ID = :id', {id: id})
            .getMany()
    }

    @Post(':tradingPointId/terminal')
    async assignNewTerminal(@Param('tradingPointId') id: string, @Body() dto: any) {
        let point = await TradingPoint.findOne({ID: id});
        let user = await User.findOne({phone: dto.phone}, {relations: ['terminal']});
        await this.createNewTerminal(user, point, dto);
        return user.terminal;
    }

    @Get('/excel')
    getImage(@Res() response) {
        response.download('public/excel/trading-point.xlsx', 'Punkty Handlowe.xlsx');
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

    @Get(':id')
    async getTradePointById(@Param('id') id: string) {
        const point = await TradingPoint.findOne({ID: id}, {relations: ['city', 'type', 'terminals', 'transactions']});
        return {
            ID: point.ID,
            city: point.city.name,
            type: point.type.name,
            name: point.name,
            address: point.address,
            donationPercentage: point.donationPercentage,
            vat: point.vat,
            longitude: point.longitude,
            latitude: point.latitude,
            fee: point.fee,
            postCode: point.postCode,
            xp: point.xp
        }
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
        entity.fee = dto.fee;
        entity.postCode = dto.postCode;
        entity.xp = dto.xp;
    }

    private async createNewTerminal(user: User, point: TradingPoint, dto: any, isMain: boolean = false) {
        const role = await Role.findOne({name: RoleEnum.TERMINAL});
        if (!user) {
            user = new User();
            user.phone = dto.phone;
            user.phonePrefix = dto.phonePrefix;
            let account = new Account();
            account.role = role;
            let counts = await Terminal.count({tradingPoint: point});
            account.ID = [point.ID, this.codeService.generateTerminalNumber(counts)].join('-');
            let terminal = new Terminal();
            terminal.isMain = true;
            terminal.ID = account.ID;
            terminal.phone = user.phone;
            terminal.tradingPoint = point;
            await getConnection().transaction(async entityManager => {
                user.terminal = await entityManager.save(terminal);
                account.user = await entityManager.save(user);
                await entityManager.save(account);
            })
        } else {
            let terminal = new Terminal();
            terminal.phone = user.phone;
            terminal.tradingPoint = point;
            terminal.isMain = true;
            let account = new Account();
            account.role = role;
            if (isMain) {
                terminal.isMain = true;
            }
            await getConnection().transaction(async entityManager => {
                let counts = await Terminal.count({tradingPoint: point});
                account.ID = [point.ID, this.codeService.generateTerminalNumber(counts)].join('-');
                terminal.ID = account.ID;
                user.terminal = await entityManager.save(terminal);
                account.user = await entityManager.save(user);
                await entityManager.save(account);
            })
        }
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
        tradePoint.fee = row.manipulationFee ? row.manipulationFee : 0.66;
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
            tradePoint = await tradePoint.save();
            this.createNewTerminal(null, tradePoint, row, true);
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
            'Phone Prefix': 'phonePrefix',
            'Phone': 'phone',
            'Xp': 'xp',
            'City': 'city',
        };
        const newRow = {};
        Object.keys(columnMapping).forEach(key => newRow[columnMapping[key]] = row[key]);
        return new TradingPointExcelRow(newRow);
    }

}
