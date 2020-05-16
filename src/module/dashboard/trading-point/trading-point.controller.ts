import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Logger,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {TradingPoint} from "../../../entity/trading-point.entity";
import {EntityManager, getConnection, QueryFailedError} from "typeorm";
import {FileInterceptor} from "@nestjs/platform-express";
import {City} from "../../../entity/city.entity";
import {TradingPointType} from "../../../entity/trading-point-type.entity";
import {ApiBearerAuth, ApiConsumes, ApiHeader, ApiTags} from "@nestjs/swagger";
import {validate} from "class-validator";
import {extractErrors} from "../../../common/util/functions";
import {ExcelException} from "../../../common/exceptions/excel.exception";
import {CodeService} from "../../../common/service/code.service";
import {Terminal} from "../../../entity/terminal.entity";
import {diskStorage} from "multer";
import {TradingPointExcelRow} from "../../../models/dashboard/excel/trading-point-row.excel";
import {Phone} from "../../../entity/phone.entity";
import {PhonePrefix} from "../../../entity/phone-prefix.entity";
import {Account} from "../../../entity/account.entity";
import {Role} from "../../../entity/role.entity";
import {RoleEnum} from "../../../common/enum/role.enum";
import {Address} from "../../../entity/address.entity";
import {Status, Step} from "../../../common/enum/status.enum";
import {TradingPointSaveRequest} from "../../../models/dashboard/request/trading-point-save.request";
import {Opinion} from "../../../entity/opinion.entity";
import {Roles} from "../../../common/decorators/roles.decorator";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";
import {Const} from "../../../common/util/const";

const moment = require("moment");

@Controller()
@ApiTags('trading-point')
export class TradingPointController {
    private readonly logger = new Logger(TradingPointController.name);

    constructor(private readonly codeService: CodeService) {
    }

    @Get()
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async getAllTradePoints(@Query() query: { name: string, type: string, city: string }) {
        let sql = await TradingPoint.createQueryBuilder('t')
            .leftJoinAndSelect('t.address', 'address')
            .leftJoinAndSelect('t.phone', 'phone')
            .leftJoinAndSelect('phone.prefix', 'prefix')
            .leftJoinAndSelect('address.city', 'city')
            .leftJoinAndSelect('t.type', 'type');

        if (query.name) {
            sql = sql.andWhere('t.name like "%:name"', {name: query.name})
        }
        if (query.type) {
            sql = sql.andWhere('type.id = :type', {type: query.type})
        }
        if (query.city) {
            sql = sql.andWhere('city.id = :city', {city: query.city})
        }
        const tradingPoints = await sql
            .select('t.ID', 'ID')
            .addSelect('type.name', 'type')
            .addSelect('t.name', 'name')
            .addSelect('city.name', 'city')
            .addSelect('t.email', 'email')
            .addSelect('phone.value', 'phone')
            .addSelect('prefix.value', 'prefix')
            .getRawMany();

        return tradingPoints
    }

    @Get('opinion')
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async getOpinionsForTradingPoints() {
        return await Opinion.createQueryBuilder("o")
            .leftJoinAndSelect("o.tradingPoint", 'point')
            .leftJoin("o.user", 'client')
            .leftJoinAndSelect("point.phone", "phone")
            .leftJoinAndSelect("phone.prefix", "prefix")
            .where("client is null")
            .select("o.value", "value")
            .addSelect("o.email", "email")
            .addSelect("prefix.value", "prefix")
            .addSelect("phone.value", "phone")
            .addSelect("point.name", "name")
            .addSelect("o.createdAt", "createdAt")
            .getRawMany();
    }

    @Get('/excel')
    getImage(@Res()response: any) {
        response.setHeader('Content-Disposition', 'attachment; filename=' + 'tradingPoint.xlsx');
        response.sendFile('trading-point.xlsx', {root: 'public/excel'});
    }

    @Get(':ID')
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async getTradePointById(@Param('ID') id: string) {
        const p: TradingPoint | undefined = await TradingPoint.createQueryBuilder('t')
            .leftJoinAndSelect('t.address', 'address')
            .leftJoinAndSelect('t.phone', 'phone')
            .leftJoinAndSelect('address.city', 'city')
            .leftJoinAndSelect('t.type', 'type')
            .leftJoinAndSelect('t.terminals', 'terminal')
            .leftJoinAndSelect('terminal.account', 'account')
            .leftJoinAndSelect('terminal.phone', 'tPhone')
            .leftJoinAndSelect('t.transactions', 'transaction')
            .leftJoinAndSelect('transaction.correction', 'correction')
            .where('t.ID = :ID', {ID: id})
            .getOne();

        if (!p) {
            throw new NotFoundException('trading_point_does_not_exists')
        }

        return {
            ID: p.ID,
            type: p.type.id,
            phone: p.phone.value,
            name: p.name,
            address: {
                city: p.address.city.id,
                street: p.address.street,
                number: p.address.number,
                postCode: p.address.postCode,
                longitude: p.address.longitude,
                latitude: p.address.longitude
            },
            donationPercentage: p.donationPercentage,
            vat: p.vat,
            fee: p.fee,
            xp: p.xp,
            image: p.image,
            email: p.email,
            price: p.price,
            active: p.active,
            description: p.description,
            terminals: p.terminals?.filter(t => !t.isMain).map((t: Terminal) => {
                return {
                    ID: t.ID,
                    name: t.name,
                    phone: t.phone?.value,
                    step: t.step
                }
            }),
            transactions: p.transactions?.map(t => {
                return {
                    type: t.correction ? "CORRECTION" : "TRANSACTION",
                    price: t.price,
                    date: t.createdAt,
                    xp: t.tradingPointXp
                }
            })
        }
    }

    @Post()
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async createTradePoint(@Body() dto: TradingPointSaveRequest) {
        await getConnection().transaction(async (entityManager: EntityManager) => {
            let type = await TradingPointType.findOne({id: dto.type});
            if (!type) {
                throw new NotFoundException('trading_point_type_does_not_exists');
            }

            let city = await City.findOne({id: dto.address.city});
            if (!city) {
                throw new NotFoundException('city_does_not_exists');
            }

            let prefix = await PhonePrefix.findOne({value: 48});
            if (!prefix) {
                throw new NotFoundException('phone_prefix_does_not_exists')
            }

            if (dto.phone.toString().length > prefix.maxLength) {
                throw new BadRequestException('invalid_phone_value');
            }

            let phone = new Phone(dto.phone, prefix);

            const address = new Address(
                dto.address.street,
                dto.address.number,
                dto.address.postCode,
                city,
                dto.address.longitude,
                dto.address.latitude
            );

            let point = new TradingPoint(
                this.codeService.generateTradingPointNumber(type.code),
                dto.name,
                dto.email,
                await entityManager.save(phone),
                type,
                await entityManager.save(address)
            );

            point.donationPercentage = dto.donationPercentage;
            point.price = dto.price;
            point.active = dto.active;
            point.vat = dto.vat;
            point.fee = dto.fee;
            point.xp = dto.xp;
            point.description = dto.description;

            await entityManager.save(point);

            await this.createNewTerminal(entityManager, phone, point, true)
        })
    }

    @Put(":ID")
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async updateTradingPointInformation(@Param('ID') id: string, @Body() dto: TradingPointSaveRequest) {
        let point = await TradingPoint.findOne({ID: id}, {relations: ['address', 'phone']});
        if (!point) {
            throw new NotFoundException('trading_point_does_not_exists')
        }

        let type = await TradingPointType.findOne({id: dto.type});
        if (!type) {
            throw new NotFoundException('trading_point_type_does_not_exists');
        }

        let city = await City.findOne({id: dto.address.city});
        if (!city) {
            throw new NotFoundException('city_does_not_exists');
        }

        let prefix = await PhonePrefix.findOne({value: 48});
        if (!prefix) {
            throw new NotFoundException('phone_prefix_does_not_exists')
        }

        if (dto.phone.toString().length > prefix.maxLength) {
            throw new BadRequestException('invalid_phone_value');
        }


        point.name = dto.name;
        point.donationPercentage = dto.donationPercentage;
        point.email = dto.email;
        point.price = dto.price;
        point.active = dto.active;
        point.vat = dto.vat;
        point.fee = dto.fee;
        point.xp = dto.xp;
        point.type = type;
        point.description = dto.description;

        const address = point.address;

        address.street = dto.address.street;
        address.number = dto.address.number;
        address.postCode = dto.address.postCode;
        address.longitude = dto.address.longitude;
        address.latitude = dto.address.latitude;
        address.city = city;

        let phone = point.phone;
        phone.value = dto.phone;

        await getConnection().transaction(async (entityManager: EntityManager) => {
            await entityManager.save(point);
            await entityManager.save(phone);
            await entityManager.save(address)
        })
    }

    @Post(':ID/image')
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination(req, file, cb) {
                cb(null, 'public/image');
            },
            filename(req, file, cb) {
                if (file) {
                    cb(null, Date.now() + '-' + file.originalname);
                }
            },
        }),
    }))
    async updateTradingPointImage(@Param("ID") id: string, @UploadedFile() image: any) {
        let point = await TradingPoint.findOne({ID: id});

        if (!point) {
            throw new NotFoundException('trading_point_does_not_exists')
        }

        point.image = image.filename;
        await point.save()
    }

    @Post(':ID/terminal')
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    async assignNewTerminal(@Param('ID') id: string, @Body() dto: any) {
        const role = await Role.findOne({value: RoleEnum.TERMINAL});

        if (!role) {
            this.logger.error('TERMINAL Role does not exists');
            throw new BadRequestException('internal_server_error');
        }

        const terminal = await Terminal.createQueryBuilder('t')
            .leftJoinAndSelect('t.tradingPoint', 'point')
            .leftJoinAndSelect('t.phone', 'phone')
            .leftJoinAndSelect('t.account', 'account')
            .where('phone.value = :phone', {phone: dto.phone})
            .andWhere('point.ID = :ID', {ID: id})
            .getOne();

        if (terminal) {
            let account = terminal.account;
            if (account.status === Status.DELETED) {
                terminal.account.status = Status.ACTIVE;
                terminal.name = dto.name;
                terminal.step = Step.SIGN_IN;
                await terminal.save();
                return {
                    ID: terminal.ID,
                    name: terminal.name,
                    phone: terminal.phone?.value,
                    step: terminal.step
                }
            } else {
                this.logger.error('Terminal is already assigned to Trading Point');
                throw new BadRequestException('excel_terminal_already_assigned')
            }
        } else {
            const point = await TradingPoint.findOne({ID: id});

            if (!point) {
                throw new NotFoundException('trading_point_does_not_exists')
            }

            let counts = await Terminal.count({tradingPoint: point});
            const accountID = [point.ID, this.codeService.generateTerminalNumber(counts)].join('-');

            const account = new Account(accountID, role);

            return await getConnection().transaction(async entityManager => {
                const prefix = await PhonePrefix.findOne({value: 48});
                if (prefix) {
                    if (dto.phone.toString().length > prefix.maxLength) {
                        throw new BadRequestException('invalid_phone_number')
                    }

                    let phone = new Phone(dto.phone, prefix);
                    const newTerminal = new Terminal(accountID, await entityManager.save(phone), point, await entityManager.save(account));
                    newTerminal.isMain = false;
                    newTerminal.name = dto.name;
                    await entityManager.save(newTerminal);

                    return {
                        ID: newTerminal.ID,
                        name: newTerminal.name,
                        phone: newTerminal.phone?.value,
                        step: newTerminal.step
                    }
                } else {
                    throw new BadRequestException('phone_prefix_does_not_exists')
                }
            });
        }
    }

    @Post("import")
    @ApiBearerAuth()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
    @ApiConsumes('multipart/form-data')
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

    private async createNewTerminal(entityManager: EntityManager, phone: Phone, point: TradingPoint, isMain: boolean = false) {
        const role = await Role.findOne({value: RoleEnum.TERMINAL});

        if (!role) {
            this.logger.error('TERMINAL Role does not exists');
            throw new BadRequestException('internal_server_error');
        }

        let terminal: Terminal | undefined = await Terminal.findOne({phone: phone});

        if (!terminal) {
            let counts = await Terminal.count({tradingPoint: point});
            const accountID = [point.ID, this.codeService.generateTerminalNumber(counts)].join('-');
            const account = new Account(accountID, role);

            terminal = new Terminal(accountID, phone, point, await entityManager.save(account));
            terminal.isMain = isMain;
            await entityManager.save(terminal);

            if (!terminal) {
                this.logger.error('Terminal was not saved');
                throw new BadRequestException('internal_server_error')
            }
        } else {
            this.logger.error('Terminal is already assigned to Trading Point');
            throw new BadRequestException('excel_terminal_already_assigned')
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
                        row.email,
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
            'E-mail': 'email',
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
