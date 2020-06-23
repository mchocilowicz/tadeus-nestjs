import { BadRequestException, Body, Controller, Get, Logger, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiHeader, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "../../../common/decorators/roles.decorator";
import { RoleType } from "../../../common/enum/roleType";
import { JwtAuthGuard } from "../../../common/guards/jwt.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Const } from "../../../common/util/const";
import { UserDetailsRequest } from "../../../models/client/request/user-details.request";
import { User } from "../../../entity/user.entity";
import { Phone } from "../../../entity/phone.entity";
import { getConnection } from "typeorm";
import { UserDetailsResponse } from "../../../models/client/request/user-details.response";
import { PhonePrefix } from "../../../entity/phone-prefix.entity";

@Controller()
@ApiBearerAuth()
@ApiHeader(Const.SWAGGER_LANGUAGE_HEADER)
@ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
@ApiTags('information')
export class InformationController {

    private readonly logger = new Logger(InformationController.name);

    @Get() @Roles(RoleType.CLIENT) @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, type: UserDetailsResponse})
    getUserData(@Req() req: any): UserDetailsResponse {
        let user: User = req.user;
        let phone: Phone | undefined = user.phone;

        if (phone) {
            return new UserDetailsResponse(user, phone.value);
        }

        return new UserDetailsResponse(user);

    }

    @Put() @Roles(RoleType.CLIENT) @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBody({type: UserDetailsRequest})
    async updateUserData(@Req() req: any, @Body() dto: UserDetailsRequest) {
        const user: User = req.user;
        let phone: Phone | undefined = user.phone;

        await getConnection().transaction(async entityManager => {
            if (user.prevName) {
                throw new BadRequestException('user_name_changed')
            }

            if (phone) {
                phone.value = dto.phone;
                await entityManager.save(phone);
            } else {
                phone = await Phone.findNumber(dto.phonePrefix, dto.phone);
                const prefix = await PhonePrefix.findOne({value: dto.phonePrefix});

                if (!prefix) {
                    throw new BadRequestException('phone_prefix_not_exists');
                }

                await entityManager.save(new Phone(dto.phone, prefix));
            }

            user.updateInformation(dto.firstName, dto.lastName, dto.email, dto.bankAccount);
            await entityManager.save(user);
        });
    }
}

