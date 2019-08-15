import { Body, Controller, Delete, Get, Logger, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiConsumes, ApiImplicitBody, ApiImplicitFile, ApiImplicitHeader } from "@nestjs/swagger";
import { Const } from "../../../common/util/const";
import { NgoRequest } from "../../../models/request/ngo.request";
import { Ngo } from "../../../database/entity/ngo.entity";
import { createQueryBuilder, QueryFailedError } from "typeorm";
import { extractErrors, handleException } from "../../../common/util/functions";
import { NgoTypeRequest } from "../../../models/request/ngo-type.request";
import { NgoType } from "../../../database/entity/ngo-type.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { NgoRowExcel } from "../../../models/excel/ngo-row.excel";
import { validate } from "class-validator";
import { ExcelException } from "../../../common/exceptions/excel.exception";
import { City } from "../../../database/entity/city.entity";

@Controller()
export class DashboardNgoController {
    private readonly logger = new Logger(DashboardNgoController.name);

    @Post()
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: NgoRequest})
    async create(@Body() dto: NgoRequest) {
        console.log(dto);
        const ngo = new Ngo();
        ngo.city = dto.city;
        ngo.latitude = dto.latitude;
        ngo.longitude = dto.longitude;
        ngo.name = dto.name;
        ngo.type = dto.type;
        ngo.bankNumber = dto.bankNumber;
        ngo.email = dto.email;
        ngo.phone = dto.phone;
        try {
            await createQueryBuilder('Ngo').insert().values(ngo).execute();
        } catch (e) {
            handleException(e, 'ngo', this.logger)
        }
    }

    @Post("upload")
    @ApiConsumes('multipart/form-data')
    @ApiImplicitFile({name: 'file', required: true, description: 'XLSX file with Ngo definitions'})
    @UseInterceptors(FileInterceptor('file'))
    async uploadNgoWithFile(@UploadedFile() file) {
        const xlsx = require('xlsx');
        const workbook = xlsx.readFile(file.path);
        const sheetNames = workbook.SheetNames;
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
        const errors = [];
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

    private async saveNgoRow(row: any, index: number, errors: object[]) {
        let data = this.mapRowColumns(row);
        let validationErrors = await validate(row);
        if (validationErrors.length > 0) {
            let code = extractErrors(validationErrors);
            throw new ExcelException({row: index, message: code});
        }
        let ngo = new Ngo();
        let city = await City.findOne({name: data.city});
        let type = await NgoType.findOne({name: data.type});

        if (!city) {
            city = new City();
            city.name = data.city;
            city = await city.save()
        }
        if (!type) {
            type = new NgoType();
            type.name = data.type;
            type = await type.save();
        }
        ngo.city = city;
        ngo.type = type;
        ngo.bankNumber = data.accountNumber;
        ngo.phone = data.phone;
        ngo.email = data.email;
        ngo.verified = data.verified;
        ngo.verificationDate = data.verificationDate;
        ngo.longitude = data.longitude;
        ngo.latitude = data.latitude;
        ngo.name = data.name;
        ngo.address = data.address;
        ngo.postCode = data.postCode;
        try {
            await ngo.save();
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

    }

    private mapRowColumns(row): NgoRowExcel {
        const columnMapping = {
            'Name': 'name',
            'Type': 'type',
            'Account number': 'accountNumber',
            'Phone': 'phone',
            'E-mail': 'email',
            'Latitude': 'latitude',
            'Longitude': 'longitude',
            'Verified': 'verified',
            'Verification Date': 'verificationDate',
            'City': 'city',
            'Address': 'address',
            'Post Code': 'postCode'
        };
        const newRow = {};
        Object.keys(columnMapping).forEach(key => newRow[columnMapping[key]] = row[key]);
        return new NgoRowExcel(newRow);
    }

    @Get(':ngoId')
    getNgoById(@Param('ngoId') ngoId: string) {
        return Ngo.findOne({id: ngoId}, {relations: ['city', 'type', 'transactions', 'donations']})
    }

    @Delete()
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    delete() {
    }

    @Post('type')
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: NgoTypeRequest})
    async createNgoType(@Body() dto: NgoTypeRequest) {
        const type = new NgoType();
        type.name = dto.name;
        try {
            await createQueryBuilder('NgoType').insert().values(type).execute();
        } catch (e) {
            handleException(e, 'ngo_type', this.logger)
        }
    }
}
