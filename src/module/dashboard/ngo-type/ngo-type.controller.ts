import { Body, Controller, Get, Logger, NotFoundException, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiHeader, ApiTags } from "@nestjs/swagger";
import { Const } from "../../../common/util/const";
import { NgoTypeRequest } from "../../../models/common/request/ngo-type.request";
import { NgoType } from "../../../database/entity/ngo-type.entity";
import { handleException } from "../../../common/util/functions";

@Controller()
@ApiTags('trading-point-type')
export class NgoTypeController {
    private readonly logger = new Logger(NgoTypeController.name);

    constructor() {
    }

    @Post()
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    @ApiBody({type: NgoTypeRequest})
    async createNgoType(@Body() dto: NgoTypeRequest) {
        const type = new NgoType(dto.name);
        try {
            return await type.save()
        } catch (e) {
            handleException(e, 'ngo_type', this.logger)
        }
    }

    @Put(':id')
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    async updateType(@Param('id') id: string, @Body() dto: any) {
        const type: NgoType | undefined = await NgoType.findOne({id: id});

        if (!type) {
            throw new NotFoundException('ngo_type_not_exists')
        }

        type.name = dto.name;
        return await type.save()
    }

    @Get()
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    getAllTypes() {
        return NgoType.find();
    }
}
