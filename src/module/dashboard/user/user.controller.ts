import {Controller, Get, NotFoundException, Param} from "@nestjs/common";
import {RoleEnum} from "../../../common/enum/role.enum";
import {User} from "../../../database/entity/user.entity";
import {Status} from "../../../common/enum/status.enum";
import {ApiUseTags} from "@nestjs/swagger";

@Controller()
@ApiUseTags('user')
export class UserController {

    @Get()
    async getAllUsers() {
        const users: User[] = await User.createQueryBuilder('user')
            .leftJoinAndSelect(`user.account`, 'account')
            .leftJoinAndSelect('account.role', 'role')
            .where(`role.value = :role`, {role: RoleEnum.CLIENT})
            .andWhere('account.status = :status', {status: Status.ACTIVE})
            .getMany();
        return users.map((user: User) => {
            if (user && user.account) {
                return {
                    id: user.id,
                    phone: user.phone,
                    name: user.name,
                    email: user.email,
                    xp: user.xp,
                    account: user.account.role.value,
                    updatedDate: user.updatedAt
                }
            }

        })
    }

    @Get(':id')
    async getUserById(@Param('id') id: string) {
        let user = await User.findOne({id: id}, {relations: ['details', 'transactions', 'donations']});
        if (!user) {
            throw new NotFoundException('user_not_exists')
        }
        return user;
    }
}
