import { BadRequestException, Body, Controller, Get, Param, Put } from "@nestjs/common";
import { User } from "../../database/entity/user.entity";
import { createQueryBuilder } from "typeorm";
import { RoleEnum } from "../../common/enum/role.enum";
import { Status } from "../../common/enum/status.enum";

@Controller()
export class DashboardController {

    @Get('user')
    async getAllUsers() {
        const users = await createQueryBuilder("User")
            .innerJoin("User.roles",'role', "role.name = :name", {name: RoleEnum.CLIENT})
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

    @Get('user/:id')
    async getUserById(@Param('id') id: string) {
        let user =  await User.findOne({id: id}, {relations: ['ngo','transactions','donations']});
        if(!user) {
            throw new BadRequestException('Uzytkownik nie istenieje')
        }
        return user;
    }

    @Put('user/:id')
    async updateUserPhone(@Param('id') id: string, @Body() dto: {phone: string}) {
        let user = await User.findOne({id: id});
        if(!user) {
            throw new BadRequestException('Uzytkownik nie istenieje')
        }
        user.phone = dto.phone;
        await user.save();
    }

    @Put('user/:id/status')
    async updateUserStatus(@Param('id') id: string, @Body() dto: {status: Status}) {
        let user = await User.findOne({id: id});
        if(!user) {
            throw new BadRequestException('Uzytkownik nie istenieje')
        }
        user.status = dto.status;
        await user.save();
    }
}
