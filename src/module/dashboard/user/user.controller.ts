import { BadRequestException, Body, Controller, Get, Param, Put } from "@nestjs/common";
import { createQueryBuilder } from "typeorm";
import { RoleEnum } from "../../../common/enum/role.enum";
import { User } from "../../../database/entity/user.entity";
import { Status } from "../../../common/enum/status.enum";
import { ApiUseTags } from "@nestjs/swagger";

@Controller()
@ApiUseTags('dashboard/user')
export class UserController {
    @Get()
    async getAllUsers() {
        const users = await createQueryBuilder("User")
            .innerJoin("User.roles", 'role', "role.name = :name", {name: RoleEnum.CLIENT})
            .getMany();
        return users.map((user: User) => {
            return {
                id: user.id,
                phone: user.phone,
                name: user.name,
                email: user.email,
                xp: user.xp,
                status: user.status,
                updatedDate: user.updatedDate
            }
        })
    }

    @Get(':id')
    async getUserById(@Param('id') id: string) {
        let user = await User.findOne({id: id}, {relations: ['ngo', 'transactions', 'donations']});
        if (!user) {
            throw new BadRequestException('user_not_exists')
        }
        return user;
    }

    @Put(':id')
    async updateUserPhone(@Param('id') id: string, @Body() dto: { phone: string }) {
        let user = await User.findOne({id: id});
        if (!user) {
            throw new BadRequestException('user_not_exists')
        }
        user.phone = dto.phone;
        await user.save();
    }

    @Put(':id/status')
    async updateUserStatus(@Param('id') id: string, @Body() dto: { status: Status }) {
        let user = await User.findOne({id: id});
        if (!user) {
            throw new BadRequestException('user_not_exists')
        }
        user.status = dto.status;
        await user.save();
    }
}
