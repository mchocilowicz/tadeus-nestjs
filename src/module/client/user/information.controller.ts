import {BadRequestException, Body, Controller, Get, Logger, Put, Req, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiBody, ApiHeader, ApiResponse, ApiTags} from "@nestjs/swagger";
import {Roles} from "../../../common/decorators/roles.decorator";
import {RoleEnum} from "../../../common/enum/role.enum";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";
import {Const} from "../../../common/util/const";
import {UserDetailsRequest} from "../../../models/client/request/user-details.request";
import {User} from "../../../entity/user.entity";
import {Phone} from "../../../entity/phone.entity";
import {getConnection} from "typeorm";
import {UserDetailsResponse} from "../../../models/client/request/user-details.response";

@Controller()
@ApiBearerAuth()
@ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
@ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
@ApiTags('information')
export class InformationController {

    private readonly logger = new Logger(InformationController.name);

    @Get()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: UserDetailsResponse})
    getUserData(@Req() req: any): UserDetailsResponse {
        let user: User = req.user;
        let phone: Phone | undefined = user.phone;

        if (!phone) {
            this.logger.error(`User ${user.id} does not have assigned Phone`);
            throw new BadRequestException('internal_server_error')
        }

        return new UserDetailsResponse(user, phone);
    }

    @Put()
    @Roles(RoleEnum.CLIENT)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBody({type: UserDetailsRequest})
    async updateUserData(@Req() req: any, @Body() dto: UserDetailsRequest) {
        const user: User = req.user;
        const phone: Phone | undefined = user.phone;

        if (!phone) {
            this.logger.error(`User ${user.id} does not have assigned Phone`);
            throw new BadRequestException('internal_server_error')
        }

        phone.value = dto.phone;

        await getConnection().transaction(async entityManager => {
            if (user.prevName) {
                throw new BadRequestException('user_name_changed')
            }

            user.updateInformation(dto.firstName, dto.lastName, dto.email, dto.bankAccount);
            await entityManager.save(user);
            await entityManager.save(phone);
        });
    }
}

