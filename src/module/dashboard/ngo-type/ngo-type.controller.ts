import {Body, Controller, Get, Logger, NotFoundException, Param, Post, Put} from "@nestjs/common";
import {ApiImplicitBody, ApiImplicitHeader, ApiUseTags} from "@nestjs/swagger";
import {Const} from "../../../common/util/const";
import {NgoTypeRequest} from "../../../models/request/ngo-type.request";
import {NgoType} from "../../../database/entity/ngo-type.entity";
import {handleException} from "../../../common/util/functions";

@Controller()
@ApiUseTags('trading-point-type')
export class NgoTypeController {
    private readonly logger = new Logger(NgoTypeController.name);

    constructor() {
    }

    @Post()
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    @ApiImplicitBody({name: '', type: NgoTypeRequest})
    async createNgoType(@Body() dto: NgoTypeRequest) {
        const type = new NgoType(dto.name);
        try {
            return await type.save()
        } catch (e) {
            handleException(e, 'ngo_type', this.logger)
        }
    }

    @Put(':id')
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    async updateType(@Param('id') id: string, @Body() dto: any) {
        const type: NgoType | undefined = await NgoType.findOne({id: id});

        if (!type) {
            throw new NotFoundException('ngo_type_not_exists')
        }

        type.name = dto.name;
        return await type.save()
    }

    @Get()
    @ApiImplicitHeader({
        name: Const.HEADER_ACCEPT_LANGUAGE,
        required: true,
        description: Const.HEADER_ACCEPT_LANGUAGE_DESC
    })
    getAllTypes() {
        return NgoType.find();
    }
}
