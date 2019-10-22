import { Body, Controller, Get, Logger, Param, Post, Put } from "@nestjs/common";
import { ApiImplicitBody, ApiImplicitHeader, ApiUseTags } from "@nestjs/swagger";
import { Const } from "../../../common/util/const";
import { handleException } from "../../../common/util/functions";
import { TradingPointType } from "../../../database/entity/trading-point-type.entity";
import { TradingPointTypeRequest } from "../../../models/request/trading-point-type.request";

@Controller()
@ApiUseTags('trading-point-type')
export class TradingPointTypeController {
    private readonly logger = new Logger(TradingPointTypeController.name);

    constructor() {
    }

    @Post()
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

    @Get()
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    getAllTypes() {
        return TradingPointType.find();

    }

    @Put(':id')
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
