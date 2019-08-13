import { Body, Controller, Get, HttpCode, Logger, Param, Post, Put } from "@nestjs/common";
import { City } from "../../database/entity/city.entity";
import { ApiImplicitBody, ApiImplicitHeader, ApiResponse, ApiUseTags } from "@nestjs/swagger";
import { Const } from "../../common/util/const";
import { CityRequest } from "../../models/request/city.request";
import { CityResponse } from "../../models/response/city.response";
import { handleException } from "../../common/util/functions";

@Controller()
@ApiUseTags('city')
export class CityController {
    private readonly logger = new Logger(CityController.name);

    @Post()
    @HttpCode(200)
    @ApiResponse({status: 200, type: null})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: CityRequest})
    async create(@Body() dto: CityRequest) {
        const city = new City();
        city.name = dto.name;
        try {
            await city.save()
        } catch (e) {
            handleException(e, 'city', this.logger)
        }
    }

    @Get()
    @ApiResponse({status: 200, type: CityResponse, isArray: true})
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    getAll() {
        return City.find()
    }

    @Put(':id')
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiResponse({status: 200, type: null})
    async updateCity(@Param('id') id: string, @Body() body) {
        let city = await City.findOne({id: id});
        city.name = body.name;
        await city.save()
    }

}
