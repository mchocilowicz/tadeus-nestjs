import {
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
import {ApiBody, ApiConsumes, ApiHeader, ApiTags} from "@nestjs/swagger";
import {Const} from "../../../common/util/const";
import {NgoRequest} from "../../../models/common/request/ngo.request";
import {Ngo} from "../../../database/entity/ngo.entity";
import {EntityManager, getConnection, QueryFailedError} from "typeorm";
import {extractErrors, handleException} from "../../../common/util/functions";
import {NgoType} from "../../../database/entity/ngo-type.entity";
import {FileInterceptor} from "@nestjs/platform-express";
import {NgoRowExcel} from "../../../models/dashboard/excel/ngo-row.excel";
import {validate} from "class-validator";
import {ExcelException} from "../../../common/exceptions/excel.exception";
import {City} from "../../../database/entity/city.entity";
import {CodeService} from "../../../common/service/code.service";
import {PhysicalCard} from "../../../database/entity/physical-card.entity";
import {diskStorage} from "multer";
import {Phone} from "../../../database/entity/phone.entity";
import {PhonePrefix} from "../../../database/entity/phone-prefix.entity";
import {Address} from "../../../database/entity/address.entity";

const moment = require("moment");

@Controller()
@ApiTags('ngo')
export class DashboardNgoController {
    private readonly logger = new Logger(DashboardNgoController.name);

    constructor(private readonly codeService: CodeService) {
    }

    @Get()
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    getNgoList(@Query() query: any) {
        let sql = Ngo.createQueryBuilder('n')
            .leftJoinAndSelect('n.address', 'address')
            .leftJoinAndSelect('address.city', 'city')
            .leftJoinAndSelect('n.type', 'type')
            .leftJoinAndSelect('n.phone', 'phone')
            .leftJoinAndSelect('phone.prefix', 'prefix');

        if (query.name) {
            sql = sql.andWhere('n.name like "%:name"', {name: query.name})
        }
        if (query.type) {
            sql = sql.andWhere('type.id = :type', {type: query.type})
        }
        if (query.city) {
            sql = sql.andWhere('city.id = :city', {city: query.city})
        }

        return sql
            .select('n.ID', 'ID')
            .addSelect('phone.value', 'phone')
            .addSelect('n.email', 'email')
            .addSelect('n.name', 'name')
            .addSelect('n.verified', 'verified')
            .addSelect('n.verifiedAt', 'verifiedAt')
            .addSelect('type.name', 'type')
            .addSelect('city.name', 'city')
            .getRawMany();
    }


    @Get('/excel')
    getImage(@Res() response: any) {
        response.sendFile('ngo.xlsx', {root: 'public/excel'});
    }

    @Get(':ID')
    async getNgoById(@Param('ID') ngoId: string) {
        let ngo = await Ngo.createQueryBuilder('n')
            .leftJoinAndSelect('n.address', 'address')
            .leftJoinAndSelect('n.phone', 'phone')
            .leftJoinAndSelect('n.card', 'card')
            .leftJoinAndSelect('address.city', 'city')
            .leftJoinAndSelect('n.type', 'type')
            .leftJoinAndSelect('n.transactions', 'transaction')
            .where('n.ID = :ID', {ID: ngoId})
            .andWhere('n.isTadeus = false')
            .getOne();

        if (!ngo) {
            throw new NotFoundException('ngo_does_not_exists')
        }

        return {
            name: ngo.name,
            bankNumber: ngo.bankNumber,
            description: ngo.description,
            verified: ngo.verified,
            verifiedAt: ngo.verifiedAt,
            createdAt: ngo.createdAt,
            type: ngo.type.id,
            collectedDonation: ngo.card.collectedMoney,
            phone: ngo.phone.value,
            address: {
                street: ngo.address.street,
                number: ngo.address.number,
                postCode: ngo.address.postCode,
                latitude: ngo.address.latitude,
                longitude: ngo.address.longitude,
                city: ngo.address.city.id
            },
            transactions: ngo.transactions?.map(t => {
                return {
                    date: t.createdAt,
                    price: t.ngoDonation,
                    ID: t.ID
                }
            })
        }
    }

    @Post()
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    @ApiBody({type: NgoRequest})
    async create(@Body() dto: NgoRequest) {
        await getConnection().transaction(async (entityManager: EntityManager) => {
            let phone = await Phone.findNumber(dto.phonePrefix, dto.phone);
            if (!phone) {
                let prefix = await PhonePrefix.findOne({value: dto.phonePrefix});
                if (!prefix) {
                    throw new NotFoundException('internal_server_error')
                }
                phone = new Phone(dto.phone, prefix);
                phone = await entityManager.save(phone);
            }

            try {
                let ngoID = this.codeService.generateNgoNumber(dto.type.code, this.codeService.generateNumber());
                let card = new PhysicalCard(this.codeService.generatePhysicalCardNumber(ngoID));
                let address = new Address(dto.street, dto.number, dto.postCode, dto.city, dto.longitude, dto.latitude);

                let ngo = new Ngo(
                    ngoID,
                    dto.email,
                    dto.bankNumber,
                    dto.name,
                    dto.longName,
                    dto.description,
                    await entityManager.save(address),
                    dto.type,
                    phone,
                    await entityManager.save(card)
                );
                await entityManager.save(ngo);
            } catch (e) {
                handleException(e, 'ngo', this.logger)
            }
        });
    }

    @Post("import")
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
    async uploadNgoWithFile(@UploadedFile() file: any) {
        const xlsx = require('xlsx');
        const workbook = xlsx.readFile(file.path);
        const sheetNames = workbook.SheetNames;
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
        const errors: object[] = [];
        this.logger.log("Started to process excel file with NGO");
        if (sheetData.constructor.name !== 'Array') {
            await this.saveNgoRow(sheetData, 1, errors)
        } else {
            this.logger.log("Parsing excel data count: " + sheetData.length);
            for (let i = 0; i < sheetData.length; i++) {
                await this.saveNgoRow(sheetData[i], i, errors)
            }
        }
        this.logger.log("Ended to process excel file with NGO");
    }

    @Put(':ID')
    @UseInterceptors(FileInterceptor('image', {
            storage: diskStorage({
                destination(req, file, cb) {
                    cb(null, 'public/image');
                },
                filename(req, file, cb) {
                    cb(null, Date.now() + '-' + file.originalname);
                },
            }),
        }),
        FileInterceptor('thumbnail', {
            storage: diskStorage({
                destination(req, file, cb) {
                    cb(null, 'public/image');
                },
                filename(req, file, cb) {
                    cb(null, Date.now() + '-' + 'tbn-' + file.originalname);
                },
            }),
        }))
    async updateNgo(@UploadedFile() image: any, @UploadedFile() thumbnail: any) {

    }


    @Delete()
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    delete() {
    }

    private async saveNgoRow(row: any, index: number, errors: object[]) {
        let data = this.mapRowColumns(row);
        let validationErrors = await validate(row);

        if (validationErrors.length > 0) {
            let code = extractErrors(validationErrors);
            throw new ExcelException({row: index, message: code});
        }

        await getConnection().transaction(async (entityManager: EntityManager) => {
            let city = await City.findOne({name: data.city});
            if (!city) {
                city = new City(data.city);
                city = await entityManager.save(city)
            }

            let type = await NgoType.findOne({name: data.type});
            if (!type) {
                type = new NgoType(data.type);
                type = await entityManager.save(type);
            }

            let phone = await Phone.findNumber(data.phonePrefix, data.phone);
            if (!phone) {
                let prefix = await PhonePrefix.findOne({value: data.phonePrefix});
                if (!prefix) {
                    throw new NotFoundException('internal_server_error')
                }
                phone = new Phone(data.phone, prefix);
                phone = await entityManager.save(phone);
            }

            try {
                let ngoID = this.codeService.generateNgoNumber(type.code, this.codeService.generateNumber());
                let card = new PhysicalCard(this.codeService.generatePhysicalCardNumber(ngoID));
                let address = new Address(data.street, data.number, data.postCode, city, data.longitude, data.latitude);

                let ngo = new Ngo(
                    ngoID,
                    data.email,
                    data.accountNumber,
                    data.name,
                    data.longName,
                    data.description,
                    await entityManager.save(address),
                    type,
                    phone,
                    await entityManager.save(card)
                );
                await entityManager.save(ngo);
            } catch (e) {
                if (e instanceof QueryFailedError) {
                    let error: any = e;
                    if (error.code === '23505') {
                        errors.push({row: index, message: 'excel_ngo_name'})
                    }
                } else {
                    throw e;
                }
            }
        });
    }

    private mapRowColumns(row: any): NgoRowExcel {
        const columnMapping: any = {
            'Name': 'name',
            'Long Name': 'longName',
            'Description': 'description',
            'Type': 'type',
            'Account number': 'accountNumber',
            'Phone Prefix': 'phonePrefix',
            'Phone': 'phone',
            'E-mail': 'email',
            'Latitude': 'latitude',
            'Longitude': 'longitude',
            'City': 'city',
            'Street': 'street',
            'Number': 'number',
            'Post Code': 'postCode'
        };

        const newRow: any = {};

        for (let props in columnMapping) {
            if (row.hasOwnProperty(props)) {
                newRow[columnMapping[props]] = row[props];
            }
        }

        return new NgoRowExcel(newRow);
    }
}
