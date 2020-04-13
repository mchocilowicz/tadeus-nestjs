import {Body, Controller, Get, Logger, NotFoundException, Param, Post, Put, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiBody, ApiHeader, ApiTags} from "@nestjs/swagger";
import {Const} from "../../../common/util/const";
import {NgoTypeRequest} from "../../../models/common/request/ngo-type.request";
import {NgoType} from "../../../entity/ngo-type.entity";
import {handleException} from "../../../common/util/functions";
import {Roles} from "../../../common/decorators/roles.decorator";
import {RoleEnum} from "../../../common/enum/role.enum";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";

@Controller()
@ApiBearerAuth()
@ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
@ApiTags('trading-point-type')
export class NgoTypeController {
    private readonly logger = new Logger(NgoTypeController.name);

    constructor() {
    }

    @Post()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
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
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateType(@Param('id') id: string, @Body() dto: any) {
        const type: NgoType | undefined = await NgoType.findOne({id: id});

        if (!type) {
            throw new NotFoundException('ngo_type_not_exists')
        }

        type.name = dto.name;
        return await type.save()
    }

    @Get()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    getAllTypes() {
        return NgoType.find();
    }
}
