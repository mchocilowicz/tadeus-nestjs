import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    Res,
    UploadedFile,
    UseInterceptors
} from "@nestjs/common";
import {TradingPoint} from "../../../database/entity/trading-point.entity";
import {createQueryBuilder, EntityManager, getConnection, QueryFailedError} from "typeorm";
import {FileInterceptor} from "@nestjs/platform-express";
import {City} from "../../../database/entity/city.entity";
import {TradingPointType} from "../../../database/entity/trading-point-type.entity";
import {ApiConsumes, ApiImplicitFile, ApiUseTags} from "@nestjs/swagger";
import {validate} from "class-validator";
import {extractErrors} from "../../../common/util/functions";
import {ExcelException} from "../../../common/exceptions/excel.exception";
import {CodeService} from "../../../common/service/code.service";
import {Terminal} from "../../../database/entity/terminal.entity";
import {diskStorage} from "multer";
import {TradingPointExcelRow} from "../../../models/excel/trading-point-row.excel";
import {Phone} from "../../../database/entity/phone.entity";
import {PhonePrefix} from "../../../database/entity/phone-prefix.entity";
import {Account} from "../../../database/entity/account.entity";
import {Role} from "../../../database/entity/role.entity";
import {RoleEnum} from "../../../common/enum/role.enum";
import {User} from "../../../database/entity/user.entity";
import {Address} from "../../../database/entity/address.entity";

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
        // const point = new TradingPoint();
        // this.mapToBaseEntity(dto, point);
        // this.codeService.generateTradingPointNumber(dto.type.code);
        // await point.save()
    }

    @Get()
    async getAllTradePoints(@Query() query: { name: string, type: string, city: string }) {
        // let sql = await createQueryBuilder('TradingPoint', 'tradingPoint')
        //     .leftJoinAndSelect('tradingPoint.city', 'city')
        //     .leftJoinAndSelect('tradingPoint.type', 'type');
        //
        // if (query.name) {
        //     sql = sql.andWhere('tradingPoint.name like "%:name"', {name: query.name})
        // }
        // if (query.type) {
        //     sql = sql.andWhere('type.name = :type', {type: query.type})
        // }
        // if (query.city) {
        //     sql = sql.andWhere('city.name = :city', {city: query.city})
        // }
        // let tradingPoints = await sql.getMany();
        //
        // return tradingPoints.map((t: TradingPoint) => {
        //     return {
        //         ID: t.ID,
        //         type: t.type,
        //         name: t.name,
        //         donation: t.donationPercentage,
        //         vat: t.vat,
        //         fee: t.fee,
        //         city: t.city,
        //         xp: t.xp,
        //         updatedDate: t.updatedAt
        //     }
        // })
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
    async uploadTradingPointsWithFile(@UploadedFile() file: any) {
        const xlsx = require('xlsx');
        const workbook = xlsx.readFile(file.path);
        const sheetNames = workbook.SheetNames;
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
        const errors: object[] = [];
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
    async updateTradingPoint(@UploadedFile() image: any, @Body() dto: any, @Param('id') id: string) {
        let point = await TradingPoint.findOne({ID: id}, {relations: ['city', 'type']});

        if (!point) {
            throw new NotFoundException('trading_point_not_exists')
        }

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
        // let point = await TradingPoint.findOne({ID: id});
        // let user = await User.findOne({phone: dto.phone}, {relations: ['terminal']});
        // await this.createNewTerminal(user, point, dto);
        // return user.terminal;
    }

    @Get('/excel')
    getImage(@Res() response: any) {
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
        // const point = await TradingPoint.findOne({ID: id}, {relations: ['city', 'type', 'terminals', 'transactions']});
        // return {
        //     ID: point.ID,
        //     city: point.city.name,
        //     type: point.type.name,
        //     name: point.name,
        //     address: point.address,
        //     donationPercentage: point.donationPercentage,
        //     vat: point.vat,
        //     longitude: point.longitude,
        //     latitude: point.latitude,
        //     fee: point.fee,
        //     postCode: point.postCode,
        //     xp: point.xp
        // }
    }

    private mapToBaseEntity(dto: any, entity: TradingPoint): void {
        // entity.city = dto.city;
        // entity.type = dto.type;
        // entity.name = dto.name;
        // entity.address = dto.address;
        // entity.donationPercentage = dto.donationPercentage;
        // entity.vat = dto.vat;
        // entity.longitude = dto.longitude;
        // entity.latitude = dto.latitude;
        // entity.fee = dto.fee;
        // entity.postCode = dto.postCode;
        // entity.xp = dto.xp;
    }

    private async createNewTerminal(entityManager: EntityManager, phone: Phone, point: TradingPoint, isMain: boolean = false) {
        const role = await Role.findOne({value: RoleEnum.TERMINAL});

        if (!role) {
            this.logger.error('TERMINAL Role does not exists');
            throw new BadRequestException('internal_server_error');
        }

        let user: User | undefined = await User.findOne({phone: phone});

        if (!user) {
            user = new User(phone);

            let counts = await Terminal.count({tradingPoint: point});
            const accountID = [point.ID, this.codeService.generateTerminalNumber(counts)].join('-');

            let terminal = new Terminal(accountID, phone, point);
            terminal.isMain = true;
            user.terminal = await entityManager.save(terminal);

            let savedUser = await entityManager.save(user);
            if (!savedUser) {
                this.logger.error('Uzytkownik nie zostal poprawnie zapisany');
                throw new BadRequestException('internal_server_error')
            }

            await entityManager.save(new Account(accountID, role, savedUser));
        } else {

            let counts = await Terminal.count({tradingPoint: point});
            const accountID = [point.ID, this.codeService.generateTerminalNumber(counts)].join('-');

            let terminal = new Terminal(accountID, phone, point);
            if (isMain) {
                terminal.isMain = true;
            }
            let account = new Account(accountID, role, user);

            user.terminal = await entityManager.save(terminal);
            account.user = await entityManager.save(user);
            await entityManager.save(account);
        }
    }

    private async saveTradingPointRow(excelRow: Object, index: number, errors: object[]) {
        const row: TradingPointExcelRow = this.mapRowColumns(excelRow);
        let validationErrors = await validate(row);
        if (validationErrors.length > 0) {
            let code = extractErrors(validationErrors);
            throw new ExcelException({row: index, message: code});
        }
        await getConnection().transaction(async (entityManager: EntityManager) => {

            let city = await City.findOne({name: row.city});
            if (!city) {
                let c = new City(row.city);
                city = await entityManager.save(c);
            }
            let type: TradingPointType | undefined = await TradingPointType.findOne({name: row.type});
            if (!type) {
                type = new TradingPointType(row.type);
                type = await entityManager.save(type);
            }

            let phone = await Phone.findNumber(row.phonePrefix, row.phone);

            if (!phone) {
                const prefix = await PhonePrefix.findOne({value: row.phonePrefix});
                if (!prefix) {
                    throw new BadRequestException();
                }
                phone = await entityManager.save(new Phone(row.phone, prefix));
            }

            try {
                if (phone) {
                    let address = new Address(row.street, row.number, row.postCode, city, row.longitude, row.latitude);

                    let tradePoint: TradingPoint = new TradingPoint(
                        this.codeService.generateTradingPointNumber(type.code),
                        row.name,
                        row.latitude,
                        row.longitude,
                        phone,
                        type,
                        await entityManager.save(address)
                    );

                    tradePoint = await entityManager.save(tradePoint);

                    await this.createNewTerminal(entityManager, phone, tradePoint, true);
                }
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

        });
    }

    private mapRowColumns(row: any) {
        const columnMapping: any = {
            'Name': 'name',
            'Type': 'type',
            'Latitude': 'latitude',
            'Longitude': 'longitude',
            'Street': 'street',
            'Number': 'number',
            'Post code': 'postCode',
            'Phone Prefix': 'phonePrefix',
            'Phone': 'phone',
            'City': 'city',
        };

        const newRow: any = {};

        for (let props in columnMapping) {
            if (row.hasOwnProperty(props)) {
                newRow[columnMapping[props]] = row[props];
            }
        }

        return new TradingPointExcelRow(newRow);
    }

}
