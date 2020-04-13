import {Body, Controller, Get, Logger, NotFoundException, Param, Post, Put, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiBody, ApiHeader, ApiTags} from "@nestjs/swagger";
import {Const} from "../../../common/util/const";
import {handleException} from "../../../common/util/functions";
import {TradingPointType} from "../../../entity/trading-point-type.entity";
import {TradingPointTypeRequest} from "../../../models/common/request/trading-point-type.request";
import {Roles} from "../../../common/decorators/roles.decorator";
import {RoleEnum} from "../../../common/enum/role.enum";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";

@Controller()
@ApiBearerAuth()
@ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
@ApiTags('trading-point-type')
export class TradingPointTypeController {
    private readonly logger = new Logger(TradingPointTypeController.name);

    constructor() {
    }

    @Post()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
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
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    getAllTypes() {
        return TradingPointType.find();
    }

    @Put(':id')
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateType(@Param('id') id: string, @Body() dto: any) {
        const type = await TradingPointType.findOne({id: id});
        if (!type) {
            throw  new NotFoundException('trading_point_type_not_exists')
        }
        type.name = dto.name;
        return await type.save()
    }
}
