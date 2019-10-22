import { BadRequestException, Body, Controller, Get, Param, Put } from "@nestjs/common";
import { createQueryBuilder } from "typeorm";
import { RoleEnum } from "../../../common/enum/role.enum";
import { User } from "../../../database/entity/user.entity";
import { Status } from "../../../common/enum/status.enum";
import { ApiUseTags } from "@nestjs/swagger";
import { Account } from "../../../database/entity/account.entity";

@Controller()
@ApiUseTags('user')
export class UserController {
    @Get()
    async getAllUsers() {
        const users = await createQueryBuilder("User", 'user')
            .leftJoinAndSelect(`user.accounts`, 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .leftJoinAndSelect('user.details', 'details')
            .where(`role.name = :role`, {role: RoleEnum.CLIENT})
            .andWhere('accounts.status = :status', {status: Status.ACTIVE})
            .getMany();
        return users.map((user: User) => {
            return {
                id: user.id,
                phone: user.phone,
                name: user.details.name,
                email: user.email,
                xp: user.details.xp,
                status: user.accounts.find(a => a.role.name === RoleEnum.CLIENT).status,
                updatedDate: user.details.updatedAt
            }
        })
    }

    @Get(':id')
    async getUserById(@Param('id') id: string) {
        let user = await User.findOne({id: id}, {relations: ['details', 'transactions', 'donations']});
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
        let accounts = await Account.find({user: user});
        let a = accounts.find(a => a.role.name == RoleEnum.CLIENT);
        a.status = dto.status;
        await a.save();
    }
}
