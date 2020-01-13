import { Body, Controller, Get, Logger, NotFoundException, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiHeader, ApiTags } from "@nestjs/swagger";
import { Const } from "../../../common/util/const";
import { handleException } from "../../../common/util/functions";
import { TradingPointType } from "../../../database/entity/trading-point-type.entity";
import { TradingPointTypeRequest } from "../../../models/common/request/trading-point-type.request";

@Controller()
@ApiTags('trading-point-type')
export class TradingPointTypeController {
    private readonly logger = new Logger(TradingPointTypeController.name);

    constructor() {
    }

    @Post()
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    @ApiBody({type: TradingPointTypeRequest})
    async savePlaceType(@Body() dto: TradingPointTypeRequest) {
        const type = new TradingPointType(dto.name);
        try {
            return await type.save();
        } catch (e) {
            handleException(e, 'ngo_type', this.logger)
        }
    }

    @Get()
    @ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
    getAllTypes() {
        return TradingPointType.find();
    }

    @Put(':id')
    async updateType(@Param('id') id: string, @Body() dto: any) {
        const type = await TradingPointType.findOne({id: id});
        if (!type) {
            throw  new NotFoundException('trading_point_type_not_exists')
        }
        type.name = dto.name;
        return await type.save()
    }
}
